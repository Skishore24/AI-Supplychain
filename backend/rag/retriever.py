import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.ai import DocumentChunk, KnowledgeDocument
from rag.embeddings import get_embedding_provider

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a, b in zip(v1, v2)))
    norm_b = math.sqrt(sum(b * b for a, b in zip(v1, v2)))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(dot / (norm_a * norm_b))

class HybridRetriever:
    """
    Hybrid retriever combining dense vector embeddings and PostgreSQL keyword matching.
    Crucial for SKUs, contract terms, supplier IDs, and company policy lookup.
    """

    def __init__(self):
        self.embedder = get_embedding_provider()

    def retrieve(
        self,
        db: Session,
        query: str,
        top_k: int = 20,
        document_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        query_clean = query.strip()
        if not query_clean:
            return []

        # 1. Generate query embedding
        query_vec = self.embedder.embed_query(query_clean)

        # 2. Fetch candidate chunks from indexed documents
        chunks_query = db.query(DocumentChunk, KnowledgeDocument).join(
            KnowledgeDocument, DocumentChunk.document_id == KnowledgeDocument.id
        ).filter(KnowledgeDocument.status == "INDEXED")

        if document_type:
            chunks_query = chunks_query.filter(KnowledgeDocument.document_type == document_type)

        all_candidates = chunks_query.all()
        if not all_candidates:
            return []

        scored_results = []
        terms = [t.lower() for t in query_clean.split() if len(t) > 2]

        for chunk, doc in all_candidates:
            # Dense vector score
            dense_score = 0.0
            if chunk.embedding and query_vec:
                dense_score = max(0.0, cosine_similarity(query_vec, chunk.embedding))

            # Keyword / Lexical exact match score
            content_lower = chunk.content.lower()
            term_hits = sum(1 for t in terms if t in content_lower)
            lexical_score = float(term_hits / max(1, len(terms)))

            # Hybrid linear combination: 65% dense semantic + 35% lexical keyword
            hybrid_score = (dense_score * 0.65) + (lexical_score * 0.35)

            meta = chunk.metadata_json or {}
            scored_results.append({
                "chunk_id": chunk.id,
                "document_id": doc.id,
                "document_name": doc.name,
                "document_type": doc.document_type,
                "chunk_index": chunk.chunk_index,
                "page": meta.get("page", 1),
                "section": meta.get("section"),
                "content": chunk.content,
                "dense_score": round(dense_score, 4),
                "lexical_score": round(lexical_score, 4),
                "hybrid_score": round(hybrid_score, 4)
            })

        # Rank descending by hybrid score
        scored_results.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return scored_results[:top_k]
