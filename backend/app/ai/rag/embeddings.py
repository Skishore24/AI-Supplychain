import math
import hashlib
from typing import List, Optional
import logging

from app.core.config import settings
from app.ai.llm.ollama_client import OllamaClient

logger = logging.getLogger("rag.embeddings")

class OllamaEmbeddingProvider:
    """
    Generates dense embeddings using local Ollama model (default: nomic-embed-text).
    Features graceful fallback to deterministic lexical hash embeddings when Ollama
    is offline or embedding model is not yet pulled.
    """

    def __init__(self, model: Optional[str] = None):
        self.model = model or settings.OLLAMA_EMBEDDING_MODEL
        self.client = OllamaClient()
        self._cache = {}

    def embed_query(self, text: str) -> List[float]:
        return self.embed_text(text)

    def embed_text(self, text: str) -> List[float]:
        cleaned = text.strip()
        if not cleaned:
            return [0.0] * 384

        cache_key = hashlib.md5(cleaned.encode("utf-8")).hexdigest()
        if cache_key in self._cache:
            return self._cache[cache_key]

        # 1. Attempt local Ollama embedding
        try:
            emb = self.client.embed_text(cleaned, model=self.model)
            if emb and len(emb) > 0:
                self._cache[cache_key] = emb
                return emb
        except Exception as e:
            logger.warning(f"Ollama embedding failed for '{self.model}': {e}")

        # 2. Resilient Deterministic Fallback Embedding (dim: 384)
        # Guarantees that vector search and indexing NEVER fail or crash when Ollama is offline
        emb = self._deterministic_fallback_embedding(cleaned, dim=384)
        self._cache[cache_key] = emb
        return emb

    def _deterministic_fallback_embedding(self, text: str, dim: int = 384) -> List[float]:
        """
        Creates a normalized pseudo-semantic embedding vector from token hashing.
        Allows cosine similarity to operate seamlessly in local development without model downloads.
        """
        vec = [0.0] * dim
        tokens = text.lower().split()
        for tok in tokens:
            h = int(hashlib.sha256(tok.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if ((h >> 8) % 2 == 0) else -1.0
            vec[idx] += sign

        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

_default_embedding_provider: Optional[OllamaEmbeddingProvider] = None

def get_embedding_provider() -> OllamaEmbeddingProvider:
    global _default_embedding_provider
    if _default_embedding_provider is None:
        _default_embedding_provider = OllamaEmbeddingProvider()
    return _default_embedding_provider
