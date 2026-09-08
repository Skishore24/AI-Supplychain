from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Type
from pydantic import BaseModel
import logging

from core.config import settings
from ai.llm.ollama_client import OllamaClient

logger = logging.getLogger("ai.provider")

class LLMProvider(ABC):
    """
    Abstract LLM Provider interface.
    Decouples agent and orchestrator code from specific LLM vendors.
    """

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Check availability of the underlying LLM provider."""
        pass

    @abstractmethod
    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        """Generate unstructured text from a prompt."""
        pass

    @abstractmethod
    def structured_generate(
        self,
        prompt: str,
        schema: Type[BaseModel],
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.1
    ) -> Optional[BaseModel]:
        """Generate and validate a structured Pydantic response."""
        pass

    @abstractmethod
    def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        """Multi-turn chat completion."""
        pass

    @abstractmethod
    def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        """Generate vector embedding for the input text."""
        pass


class OllamaProvider(LLMProvider):
    """
    Concrete local LLM Provider powered by Ollama.
    """

    def __init__(self, client: Optional[OllamaClient] = None):
        self.client = client or OllamaClient()

    def health_check(self) -> Dict[str, Any]:
        return self.client.health_check()

    async def async_health_check(self) -> Dict[str, Any]:
        return await self.client.async_health_check()

    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        result = self.client.generate(
            prompt=prompt,
            model=model,
            system=system,
            format_json=False,
            temperature=temperature
        )
        if not result.get("success"):
            logger.warning(f"Ollama generation fallback triggered: {result.get('error')}")
            return f"[AI Note: Local LLM is currently unreachable or model is initializing. Deterministic data has been preserved.]"
        return result.get("response", "")

    def structured_generate(
        self,
        prompt: str,
        schema: Type[BaseModel],
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.1
    ) -> Optional[BaseModel]:
        """
        Requests JSON formatted output, validates with schema, and repairs invalid JSON if possible.
        """
        schema_json = schema.model_json_schema()
        json_instruction = (
            f"\nIMPORTANT: You must respond ONLY with a valid JSON object conforming to this schema:\n"
            f"{schema_json}\nDo not include any conversational preamble or postscript."
        )
        full_prompt = f"{prompt}\n{json_instruction}"

        result = self.client.generate(
            prompt=full_prompt,
            model=model,
            system=system,
            format_json=True,
            temperature=temperature
        )

        raw_response = result.get("response", "")
        parsed = self.client.safe_parse_json(raw_response)
        if not parsed:
            logger.error(f"Failed to parse JSON from Ollama output: {raw_response[:200]}")
            return None

        try:
            return schema.model_validate(parsed)
        except Exception as validation_error:
            logger.error(f"Schema validation error on parsed JSON: {validation_error}")
            return None

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        try:
            # Synchronous wrapper using httpx client
            with self.client._client() as client:
                target_model = model or settings.OLLAMA_MODEL
                resp = client.post("/api/chat", json={
                    "model": target_model,
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": temperature}
                })
                if resp.status_code == 200:
                    return resp.json().get("message", {}).get("content", "")
        except Exception as e:
            logger.warning(f"Ollama chat error: {e}")
        return "The AI assistant is temporarily operating in deterministic mode because the local LLM is offline."

    def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        return self.client.embed_text(text, model=model)


_default_provider: Optional[LLMProvider] = None

def get_llm_provider() -> LLMProvider:
    global _default_provider
    if _default_provider is None:
        _default_provider = OllamaProvider()
    return _default_provider
