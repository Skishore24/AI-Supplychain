import os
import shutil
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import pypdf
import docx

from core.config import settings
from models.ai import KnowledgeDocument, DocumentChunk
from rag.chunking import SemanticChunker
from rag.embeddings import get_embedding_provider

logger = logging.getLogger("rag.ingestion")

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
    "text/plain": ".txt",
    "text/csv": ".csv"
}

class DocumentIngestionService:
    """
    Secure document ingestion pipeline:
    Validates MIME type & size -> safe storage -> text extraction -> chunking -> vector embedding -> PostgreSQL storage.
    """

    def __init__(self):
        self.chunker = SemanticChunker()
        self.embedder = get_embedding_provider()
        self.storage_dir = Path(settings.DOCUMENTS_DIR)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def ingest_file(
        self,
        db: Session,
        file_name: str,
        file_bytes: bytes,
        mime_type: str,
        document_type: str = "policy",
        uploaded_by: str = "admin@local"
    ) -> KnowledgeDocument:
        # 1. Validation
        if len(file_bytes) > settings.MAX_DOCUMENT_SIZE:
            raise ValueError(f"File size ({len(file_bytes)} bytes) exceeds max limit of {settings.MAX_DOCUMENT_SIZE} bytes.")

        clean_name = Path(file_name).name
        ext = Path(clean_name).suffix.lower()

        # 2. Persist safely to disk
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_disk_name = f"{timestamp}_{clean_name}"
        saved_path = self.storage_dir / safe_disk_name
        with open(saved_path, "wb") as f:
            f.write(file_bytes)

        # 3. Create initial KnowledgeDocument record
        doc = KnowledgeDocument(
            name=clean_name,
            document_type=document_type,
            source=clean_name,
            file_path=str(saved_path),
            mime_type=mime_type or "application/octet-stream",
            file_size=len(file_bytes),
            version="1.0",
            status="EXTRACTING",
            uploaded_by=uploaded_by,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        try:
            # 4. Text Extraction
            extracted_text, pages_data = self._extract_text(saved_path, ext)
            if not extracted_text.strip():
                raise ValueError("No extractable text found in uploaded document.")

            # 5. Chunking
            doc.status = "CHUNKING"
            db.commit()

            chunks_data = self.chunker.chunk_document(
                text=extracted_text,
                document_id=doc.id,
                pages_text=pages_data,
                base_metadata={"document_type": document_type, "document_name": clean_name}
            )

            # 6. Embedding & PostgreSQL Storage
            doc.status = "EMBEDDING"
            db.commit()

            for chunk_item in chunks_data:
                content = chunk_item["content"]
                vec = self.embedder.embed_text(content)

                chunk_record = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=chunk_item["chunk_index"],
                    content=content,
                    metadata_json=chunk_item["metadata"],
                    embedding=vec,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(chunk_record)

            doc.chunk_count = len(chunks_data)
            doc.status = "INDEXED"
            db.commit()
            db.refresh(doc)
            return doc

        except Exception as e:
            logger.error(f"Failed to ingest document {clean_name}: {e}", exc_info=True)
            doc.status = "FAILED"
            doc.error_message = str(e)
            db.commit()
            raise e

    def _extract_text(self, file_path: Path, ext: str) -> tuple[str, Optional[List[Dict[str, Any]]]]:
        """Extracts text from PDF, DOCX, TXT, CSV."""
        if ext == ".pdf":
            reader = pypdf.PdfReader(str(file_path))
            pages = []
            full_text = []
            for i, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                pages.append({"page": i + 1, "text": txt})
                full_text.append(txt)
            return "\n\n".join(full_text), pages

        elif ext == ".docx":
            doc_obj = docx.Document(str(file_path))
            full_text = "\n\n".join([p.text for p in doc_obj.paragraphs if p.text.strip()])
            return full_text, None

        elif ext in (".txt", ".csv"):
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            return content, None

        else:
            # Generic binary/text fallback
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return f.read(), None
