from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Type
from pydantic import BaseModel
import logging
import httpx
import json

from app.core.config import settings
from app.ai.llm.ollama_client import OllamaClient

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
            return "[AI Note: Local LLM is currently unreachable or model is initializing. Deterministic data has been preserved.]"
        return result.get("response", "")

    def structured_generate(
        self,
        prompt: str,
        schema: Type[BaseModel],
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.1
    ) -> Optional[BaseModel]:
        schema_prompt = (
            f"{prompt}\n\n"
            f"IMPORTANT: Respond ONLY with valid JSON conforming to this JSON schema:\n"
            f"{schema.model_json_schema()}"
        )
        result = self.client.generate(
            prompt=schema_prompt,
            model=model,
            system=system,
            format_json=True,
            temperature=temperature
        )
        if not result.get("success"):
            logger.warning(f"Structured generate failed: {result.get('error')}")
            return None

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


class OpenAICompatibleProvider(LLMProvider):
    """
    OpenAI-compatible LLM provider for remote or local OpenAI-spec endpoints (vLLM, Groq, LiteLLM, OpenAI).
    """

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None, default_model: Optional[str] = None):
        self.base_url = (base_url or settings.OPENAI_BASE_URL).rstrip("/")
        self.api_key = api_key or settings.OPENAI_API_KEY or "none"
        self.default_model = default_model or settings.OPENAI_MODEL

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def health_check(self) -> Dict[str, Any]:
        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.get(f"{self.base_url}/models", headers=self._headers())
                if resp.status_code == 200:
                    return {"available": True, "provider": "openai_compatible", "base_url": self.base_url}
        except Exception as e:
            return {"available": False, "provider": "openai_compatible", "error": str(e)}
        return {"available": False, "provider": "openai_compatible"}

    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        return self.chat(messages, model=model, temperature=temperature)

    def structured_generate(
        self,
        prompt: str,
        schema: Type[BaseModel],
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.1
    ) -> Optional[BaseModel]:
        sys_prompt = (system or "") + f"\nRespond ONLY with valid JSON conforming to: {schema.model_json_schema()}"
        text = self.generate(prompt=prompt, model=model, system=sys_prompt, temperature=temperature)
        try:
            data = json.loads(text)
            return schema.model_validate(data)
        except Exception as e:
            logger.warning(f"OpenAI structured generate parse failed: {e}")
            return None

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        try:
            with httpx.Client(timeout=float(settings.AI_TIMEOUT_SECONDS)) as client:
                target_model = model or self.default_model
                payload = {
                    "model": target_model,
                    "messages": messages,
                    "temperature": temperature
                }
                resp = client.post(f"{self.base_url}/chat/completions", headers=self._headers(), json=payload)
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning(f"OpenAI chat error: {e}")
        return "Deterministic response: The AI provider is currently unreachable."

    def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        try:
            with httpx.Client(timeout=float(settings.AI_TIMEOUT_SECONDS)) as client:
                resp = client.post(
                    f"{self.base_url}/embeddings",
                    headers=self._headers(),
                    json={"model": model or "text-embedding-3-small", "input": text}
                )
                if resp.status_code == 200:
                    return resp.json()["data"][0]["embedding"]
        except Exception as e:
            logger.warning(f"OpenAI embedding error: {e}")
        return [0.0] * 768


_default_provider: Optional[LLMProvider] = None

def get_llm_provider() -> LLMProvider:
    global _default_provider
    if _default_provider is None:
        # Default to OllamaProvider (first class local provider)
        _default_provider = OllamaProvider()
    return _default_provider
