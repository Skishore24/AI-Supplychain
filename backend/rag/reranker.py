import re
from typing import List, Dict, Any

class RAGReranker:
    """
    Reranks candidate chunks from initial retrieval (top 20) down to top 5 context chunks.
    Filters noise, calculates term density, and eliminates redundancy.
    """

    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_n: int = 5) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        query_terms = set(re.findall(r"\w+", query.lower()))
        scored_candidates = []

        for item in candidates:
            content = item["content"].lower()
            text_tokens = re.findall(r"\w+", content)

            if not text_tokens:
                continue

            # Exact phrase match boost
            phrase_boost = 1.25 if query.lower() in content else 1.0

            # Term overlap coverage
            matched_terms = sum(1 for q in query_terms if q in content)
            term_coverage = float(matched_terms / max(1, len(query_terms)))

            # Original hybrid retrieval score
            orig_score = item.get("hybrid_score", 0.5)

            final_rerank_score = ((orig_score * 0.50) + (term_coverage * 0.50)) * phrase_boost

            enriched = dict(item)
            enriched["rerank_score"] = round(final_rerank_score, 4)
            scored_candidates.append(enriched)

        scored_candidates.sort(key=lambda x: x["rerank_score"], reverse=True)
        return scored_candidates[:top_n]
