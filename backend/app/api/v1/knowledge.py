from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user, require_admin_or_manager
from app.models.user import User
from app.models.ai import KnowledgeDocument, DocumentChunk
from app.ai.rag.ingestion import DocumentIngestionService
from app.ai.rag.pipeline import RAGPipeline

router = APIRouter(tags=["Knowledge Base & RAG"])

class SearchRequest(BaseModel):
    query: str
    document_type: Optional[str] = None
    top_k: int = 5

@router.post("/knowledge/documents")
@router.post("/v1/knowledge/documents")
async def upload_knowledge_document(
    file: UploadFile = File(...),
    document_type: str = Form("policy"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Upload and index enterprise document into PostgreSQL vector knowledge base.
    """
    content = await file.read()
    service = DocumentIngestionService()
    try:
        doc = service.ingest_file(
            db=db,
            file_name=file.filename,
            file_bytes=content,
            mime_type=file.content_type,
            document_type=document_type,
            uploaded_by=admin.email
        )
        return {
            "success": True,
            "document": {
                "id": doc.id,
                "name": doc.name,
                "document_type": doc.document_type,
                "file_size": doc.file_size,
                "status": doc.status,
                "chunk_count": doc.chunk_count,
                "created_at": doc.created_at.isoformat()
            },
            "message": f"Document '{doc.name}' successfully indexed with {doc.chunk_count} chunks."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/knowledge/documents")
@router.get("/v1/knowledge/documents")
def list_knowledge_documents(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Retrieve all knowledge documents and their chunk counts & indexing statuses.
    """
    docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()
    return {
        "total_documents": len(docs),
        "documents": [
            {
                "id": d.id,
                "name": d.name,
                "document_type": d.document_type,
                "file_size": d.file_size,
                "status": d.status,
                "error_message": d.error_message,
                "chunk_count": d.chunk_count,
                "uploaded_by": d.uploaded_by,
                "created_at": d.created_at.isoformat()
            }
            for d in docs
        ]
    }

@router.delete("/knowledge/documents/{document_id}")
@router.delete("/v1/knowledge/documents/{document_id}")
def delete_knowledge_document(
    document_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Delete document and cascade-delete its chunks.
    """
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    db.delete(doc)
    db.commit()
    return {"success": True, "message": f"Document #{document_id} and its vector chunks deleted."}

@router.post("/knowledge/documents/{document_id}/reindex")
@router.post("/v1/knowledge/documents/{document_id}/reindex")
def reindex_document(
    document_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Recompute embeddings and re-index an existing document.
    """
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    # Read file from path and re-ingest
    try:
        with open(doc.file_path, "rb") as f:
            file_bytes = f.read()
        
        # Remove old chunks
        db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()
        db.commit()

        service = DocumentIngestionService()
        doc.status = "CHUNKING"
        db.commit()

        ext = doc.name.split(".")[-1].lower()
        txt, pages = service._extract_text(service.storage_dir / doc.name, f".{ext}")
        chunks_data = service.chunker.chunk_document(txt, doc.id, pages, {"document_type": doc.document_type})
        
        for c in chunks_data:
            vec = service.embedder.embed_text(c["content"])
            chunk_rec = DocumentChunk(
                document_id=doc.id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                metadata_json=c["metadata"],
                embedding=vec
            )
            db.add(chunk_rec)
        
        doc.status = "INDEXED"
        doc.chunk_count = len(chunks_data)
        db.commit()
        return {"success": True, "chunk_count": len(chunks_data), "message": "Document reindexed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Re-indexing failed: {str(e)}")

@router.post("/knowledge/search")
@router.post("/v1/knowledge/search")
def search_knowledge_base(
    req: SearchRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Execute hybrid vector + keyword retrieval on company knowledge base.
    """
    pipeline = RAGPipeline()
    result = pipeline.answer_question(db, question=req.query, document_type=req.document_type)
    return result
