import json
import logging
import re
from typing import Dict, Any, List, Optional, AsyncGenerator
import httpx

from app.core.config import settings

logger = logging.getLogger("ai.ollama_client")

class OllamaClient:
    """
    Robust HTTP client for local Ollama API.
    Supports chat, generate, embeddings, model tags, and safe JSON output repair.
    Never crashes when Ollama is offline or when models are missing.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout_seconds: Optional[int] = None
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.timeout = float(timeout_seconds or settings.AI_TIMEOUT_SECONDS)

    def _client(self) -> httpx.Client:
        return httpx.Client(base_url=self.base_url, timeout=self.timeout)

    def _async_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout)

    def health_check(self) -> Dict[str, Any]:
        """Check if Ollama server is reachable and fetch list of installed models."""
        try:
            with self._client() as client:
                v_resp = client.get("/api/version")
                version_info = v_resp.json() if v_resp.status_code == 200 else {}
                version = version_info.get("version", "unknown")

                tags_resp = client.get("/api/tags")
                models = []
                if tags_resp.status_code == 200:
                    data = tags_resp.json()
                    models = [m.get("name") for m in data.get("models", []) if m.get("name")]

                configured_model = settings.OLLAMA_MODEL
                configured_model_available = any(configured_model in m for m in models)
                embedding_model = settings.OLLAMA_EMBEDDING_MODEL
                embedding_available = any(embedding_model in m for m in models)
                vision_model = settings.OLLAMA_VISION_MODEL
                vision_available = any(vision_model in m for m in models)

                return {
                    "available": True,
                    "base_url": self.base_url,
                    "version": version,
                    "models": models,
                    "configured_model": configured_model,
                    "configured_model_available": configured_model_available,
                    "embedding_model": embedding_model,
                    "embedding_available": embedding_available,
                    "vision_model": vision_model,
                    "vision_available": vision_available,
                    "message": "Ollama service is operational."
                }
        except httpx.ConnectError:
            return {
                "available": False,
                "base_url": self.base_url,
                "models": [],
                "message": f"Ollama is not reachable at {self.base_url}. Please ensure 'ollama serve' is running."
            }
        except Exception as e:
            return {
                "available": False,
                "base_url": self.base_url,
                "models": [],
                "message": f"Ollama health check error: {str(e)}"
            }

    async def async_health_check(self) -> Dict[str, Any]:
        """Asynchronous health check."""
        try:
            async with self._async_client() as client:
                v_resp = await client.get("/api/version")
                version = v_resp.json().get("version", "unknown") if v_resp.status_code == 200 else "unknown"

                tags_resp = await client.get("/api/tags")
                models = []
                if tags_resp.status_code == 200:
                    data = tags_resp.json()
                    models = [m.get("name") for m in data.get("models", []) if m.get("name")]

                return {
                    "available": True,
                    "base_url": self.base_url,
                    "version": version,
                    "models": models,
                    "configured_model": settings.OLLAMA_MODEL,
                    "configured_model_available": any(settings.OLLAMA_MODEL in m for m in models),
                    "embedding_model": settings.OLLAMA_EMBEDDING_MODEL,
                    "embedding_available": any(settings.OLLAMA_EMBEDDING_MODEL in m for m in models),
                    "vision_model": settings.OLLAMA_VISION_MODEL,
                    "vision_available": any(settings.OLLAMA_VISION_MODEL in m for m in models),
                    "message": "Ollama service is operational."
                }
        except Exception as e:
            return {
                "available": False,
                "base_url": self.base_url,
                "models": [],
                "message": f"Ollama is offline or unreachable ({str(e)})."
            }

    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        format_json: bool = False,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """Synchronous text generation."""
        target_model = model or settings.OLLAMA_MODEL
        payload = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature}
        }
        if system:
            payload["system"] = system
        if format_json:
            payload["format"] = "json"

        try:
            with self._client() as client:
                resp = client.post("/api/generate", json=payload)
                if resp.status_code != 200:
                    logger.warning(f"Ollama generate returned status {resp.status_code}: {resp.text}")
                    return {"success": False, "error": f"Ollama HTTP {resp.status_code}: {resp.text}", "response": ""}
                data = resp.json()
                return {"success": True, "response": data.get("response", ""), "raw": data}
        except httpx.ConnectError:
            return {
                "success": False,
                "error": f"Ollama connection refused at {self.base_url}. Ensure 'ollama serve' is active.",
                "response": ""
            }
        except Exception as e:
            return {"success": False, "error": str(e), "response": ""}

    async def async_generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        format_json: bool = False,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """Asynchronous text generation."""
        target_model = model or settings.OLLAMA_MODEL
        payload = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature}
        }
        if system:
            payload["system"] = system
        if format_json:
            payload["format"] = "json"

        try:
            async with self._async_client() as client:
                resp = await client.post("/api/generate", json=payload)
                if resp.status_code != 200:
                    return {"success": False, "error": f"Ollama HTTP {resp.status_code}: {resp.text}", "response": ""}
                data = resp.json()
                return {"success": True, "response": data.get("response", ""), "raw": data}
        except httpx.ConnectError:
            return {
                "success": False,
                "error": f"Ollama connection refused at {self.base_url}. Ensure 'ollama serve' is running.",
                "response": ""
            }
        except Exception as e:
            return {"success": False, "error": str(e), "response": ""}

    async def async_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        format_json: bool = False,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """Asynchronous chat completion."""
        target_model = model or settings.OLLAMA_MODEL
        payload = {
            "model": target_model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature}
        }
        if format_json:
            payload["format"] = "json"

        try:
            async with self._async_client() as client:
                resp = await client.post("/api/chat", json=payload)
                if resp.status_code != 200:
                    return {"success": False, "error": f"Ollama HTTP {resp.status_code}: {resp.text}", "response": ""}
                data = resp.json()
                content = data.get("message", {}).get("content", "")
                return {"success": True, "response": content, "raw": data}
        except httpx.ConnectError:
            return {
                "success": False,
                "error": f"Ollama connection refused at {self.base_url}.",
                "response": ""
            }
        except Exception as e:
            return {"success": False, "error": str(e), "response": ""}

    async def async_chat_stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2
    ) -> AsyncGenerator[str, None]:
        """Streaming chat completion yielding text deltas."""
        target_model = model or settings.OLLAMA_MODEL
        payload = {
            "model": target_model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": temperature}
        }
        try:
            async with self._async_client() as client:
                async with client.stream("POST", "/api/chat", json=payload) as response:
                    if response.status_code != 200:
                        yield f"[Ollama Error: HTTP {response.status_code}]"
                        return
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                chunk = json.loads(line)
                                text_piece = chunk.get("message", {}).get("content", "")
                                if text_piece:
                                    yield text_piece
                            except Exception:
                                continue
        except Exception as e:
            yield f"[Ollama Stream Error: {str(e)}]"

    def embed_text(self, text: str, model: Optional[str] = None) -> List[float]:
        """Generate embeddings for text using Ollama embeddings API."""
        target_model = model or settings.OLLAMA_EMBEDDING_MODEL
        payload = {"model": target_model, "prompt": text}
        try:
            with self._client() as client:
                resp = client.post("/api/embeddings", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("embedding", [])
        except Exception as e:
            logger.warning(f"Ollama embed_text failed with {target_model}: {e}")
        return []

    async def async_embed_text(self, text: str, model: Optional[str] = None) -> List[float]:
        """Asynchronous embedding generation."""
        target_model = model or settings.OLLAMA_EMBEDDING_MODEL
        payload = {"model": target_model, "prompt": text}
        try:
            async with self._async_client() as client:
                resp = await client.post("/api/embeddings", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("embedding", [])
        except Exception as e:
            logger.warning(f"Ollama async_embed_text failed with {target_model}: {e}")
        return []

    @staticmethod
    def safe_parse_json(text: str) -> Optional[Dict[str, Any]]:
        """
        Safely extracts and parses JSON even if wrapped in markdown fences,
        trailing commas, or commentary.
        """
        if not text or not text.strip():
            return None

        # 1. Direct parse attempt
        try:
            return json.loads(text.strip())
        except Exception:
            pass

        # 2. Extract JSON enclosed in ```json ... ``` or ``` ... ```
        fence_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        matches = re.findall(fence_pattern, text)
        if matches:
            for m in matches:
                try:
                    return json.loads(m.strip())
                except Exception:
                    pass

        # 3. Extract substring between first '{' and last '}'
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = text[start:end+1]
            try:
                return json.loads(candidate)
            except Exception:
                # Attempt to fix trailing commas: ,} -> } and ,] -> ]
                cleaned = re.sub(r",\s*}", "}", candidate)
                cleaned = re.sub(r",\s*]", "]", cleaned)
                try:
                    return json.loads(cleaned)
                except Exception:
                    pass

        return None
