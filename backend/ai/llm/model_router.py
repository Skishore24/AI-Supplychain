from typing import Dict, Any, Optional
import logging

from core.config import settings

logger = logging.getLogger("ai.model_router")

class ModelRouter:
    """
    Routes specialized AI tasks to optimal local Ollama models.
    Supports task-based configuration and graceful fallbacks.
    """

    TASK_MAPPING = {
        "classification": "OLLAMA_SMALL_MODEL",
        "quick_summary": "OLLAMA_SMALL_MODEL",
        "reasoning": "OLLAMA_MODEL",
        "explanation": "OLLAMA_MODEL",
        "planning": "OLLAMA_REASONING_MODEL",
        "multi_agent_synthesis": "OLLAMA_REASONING_MODEL",
        "vision": "OLLAMA_VISION_MODEL",
        "document_ocr": "OLLAMA_VISION_MODEL",
        "embedding": "OLLAMA_EMBEDDING_MODEL",
    }

    @classmethod
    def get_model_for_task(cls, task: str) -> str:
        """
        Returns the configured model name for a specific task.
        Falls back to primary OLLAMA_MODEL if specialized model is not set.
        """
        config_attr = cls.TASK_MAPPING.get(task.lower(), "OLLAMA_MODEL")
        chosen_model = getattr(settings, config_attr, None)

        if not chosen_model:
            chosen_model = settings.OLLAMA_MODEL

        return chosen_model

    @classmethod
    def get_routing_table(cls) -> Dict[str, str]:
        """Returns the full routing configuration mapping."""
        return {
            "simple_classification": settings.OLLAMA_SMALL_MODEL or settings.OLLAMA_MODEL,
            "normal_reasoning": settings.OLLAMA_MODEL,
            "complex_planning": settings.OLLAMA_REASONING_MODEL or settings.OLLAMA_MODEL,
            "embeddings": settings.OLLAMA_EMBEDDING_MODEL,
            "vision": settings.OLLAMA_VISION_MODEL,
        }
