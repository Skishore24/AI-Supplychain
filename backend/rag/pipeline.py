from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import logging

from core.config import settings
from rag.retriever import HybridRetriever
from rag.reranker import RAGReranker
from ai.llm.provider import get_llm_provider
from ai.llm.prompts import RAG_QA_PROMPT, SYSTEM_PROMPT_SUPPLY_CHAIN_BASE

logger = logging.getLogger("rag.pipeline")

class RAGPipeline:
    """
    End-to-End Enterprise RAG Pipeline:
    Hybrid Vector + Keyword Search (Top 20) -> Reranking (Top 5) -> Grounded LLM Answer with Citations.
    """

    def __init__(self):
        self.retriever = HybridRetriever()
        self.reranker = RAGReranker()
        self.llm = get_llm_provider()

    def answer_question(
        self,
        db: Session,
        question: str,
        document_type: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Retrieve candidate chunks
        candidates = self.retriever.retrieve(
            db=db,
            query=question,
            top_k=settings.RAG_TOP_K,
            document_type=document_type
        )

        if not candidates:
            return {
                "answer": "No indexed company documents or policies matched your question.",
                "sources": [],
                "confidence": 0.0,
                "has_context": False
            }

        # 2. Rerank down to top 5 context chunks
        top_chunks = self.reranker.rerank(
            query=question,
            candidates=candidates,
            top_n=settings.RAG_RERANK_K
        )

        # 3. Format context string with strict citation metadata
        context_blocks = []
        citations = []

        for c in top_chunks:
            sec_info = f" | Section: {c['section']}" if c.get("section") else ""
            header = f"[Source: {c['document_name']} (Page {c['page']}{sec_info}) | Chunk ID: {c['chunk_id']}]"
            context_blocks.append(f"{header}\n{c['content']}")

            citations.append({
                "document_name": c["document_name"],
                "document_id": c["document_id"],
                "page": c["page"],
                "section": c.get("section"),
                "chunk_id": c["chunk_id"],
                "snippet": c["content"][:200] + "..." if len(c["content"]) > 200 else c["content"],
                "relevance_score": c.get("rerank_score", 0.0)
            })

        context_str = "\n\n---\n\n".join(context_blocks)

        # 4. Prompt construction with prompt-injection defense
        prompt = RAG_QA_PROMPT.format(
            context_chunks=context_str,
            question=question
        )

        # 5. LLM Answer Generation
        llm_response = self.llm.generate(
            prompt=prompt,
            system=SYSTEM_PROMPT_SUPPLY_CHAIN_BASE,
            temperature=0.1
        )

        if not llm_response or "[AI Note:" in llm_response:
            # Deterministic fallback answer using top chunk directly
            top_c = top_chunks[0]
            llm_response = (
                f"Based on {top_c['document_name']} (Page {top_c['page']}):\n\n"
                f"\"{top_c['content'][:400]}...\""
            )

        avg_score = sum(c.get("rerank_score", 0.5) for c in top_chunks) / len(top_chunks)
        confidence = round(min(0.95, max(0.50, avg_score)), 2)

        return {
            "answer": llm_response,
            "sources": citations,
            "confidence": confidence,
            "has_context": True
        }
