import re
from typing import List, Dict, Any, Optional

class SemanticChunker:
    """
    Chunks enterprise documents (policies, contracts, SOPs, manuals) into structured chunks
    while preserving page boundaries, headings, and business entity metadata.
    """

    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 120):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(
        self,
        text: str,
        document_id: int,
        pages_text: Optional[List[Dict[str, Any]]] = None,
        base_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        base_meta = base_metadata or {}
        chunks = []

        if pages_text:
            # Multi-page extraction with page awareness
            chunk_idx = 0
            for page_item in pages_text:
                page_num = page_item.get("page", 1)
                p_text = page_item.get("text", "").strip()
                if not p_text:
                    continue

                page_chunks = self._split_text_to_chunks(p_text)
                for c_text in page_chunks:
                    section_title = self._detect_section_title(c_text)
                    chunk_meta = {
                        **base_meta,
                        "document_id": document_id,
                        "page": page_num,
                        "section": section_title
                    }
                    chunks.append({
                        "chunk_index": chunk_idx,
                        "content": c_text,
                        "metadata": chunk_meta
                    })
                    chunk_idx += 1
            return chunks

        # Single continuous document text
        plain_chunks = self._split_text_to_chunks(text)
        for idx, c_text in enumerate(plain_chunks):
            section_title = self._detect_section_title(c_text)
            chunk_meta = {
                **base_meta,
                "document_id": document_id,
                "page": 1,
                "section": section_title
            }
            chunks.append({
                "chunk_index": idx,
                "content": c_text,
                "metadata": chunk_meta
            })
        return chunks

    def _split_text_to_chunks(self, text: str) -> List[str]:
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for p in paragraphs:
            cleaned_p = p.strip()
            if not cleaned_p:
                continue

            if len(current_chunk) + len(cleaned_p) <= self.chunk_size:
                current_chunk = (current_chunk + "\n\n" + cleaned_p).strip()
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                # If paragraph itself is longer than chunk_size, split by sentences
                if len(cleaned_p) > self.chunk_size:
                    sub_sentences = re.split(r"(?<=[.?!])\s+", cleaned_p)
                    temp_sub = ""
                    for s in sub_sentences:
                        if len(temp_sub) + len(s) <= self.chunk_size:
                            temp_sub = (temp_sub + " " + s).strip()
                        else:
                            if temp_sub:
                                chunks.append(temp_sub)
                            temp_sub = s
                    current_chunk = temp_sub
                else:
                    current_chunk = cleaned_p

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    @staticmethod
    def _detect_section_title(text: str) -> Optional[str]:
        lines = text.strip().split("\n")
        if lines:
            first = lines[0].strip()
            if len(first) < 80 and (first.isupper() or re.match(r"^(Section|Article|\d+\.|\bPOLICY\b|\bPROCEDURE\b)", first, re.IGNORECASE)):
                return first
        return None
