import base64
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path
import httpx

from core.config import settings

logger = logging.getLogger("ai.multimodal.vision")

class OllamaVisionClient:
    """
    Multimodal interface to Ollama vision models (default: llama3.2-vision).
    Accepts image bytes or base64 data and generates grounded visual descriptions.
    """

    def __init__(self, model: Optional[str] = None):
        self.model = model or settings.OLLAMA_VISION_MODEL
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")

    def analyze_image(
        self,
        image_bytes: bytes,
        prompt: str,
        system: Optional[str] = None
    ) -> Dict[str, Any]:
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        payload = {
            "model": self.model,
            "prompt": prompt,
            "images": [b64_img],
            "stream": False,
            "options": {"temperature": 0.1}
        }
        if system:
            payload["system"] = system

        try:
            with httpx.Client(base_url=self.base_url, timeout=60.0) as client:
                resp = client.post("/api/generate", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return {"success": True, "response": data.get("response", ""), "raw": data}
                else:
                    return {"success": False, "error": f"Ollama vision HTTP {resp.status_code}: {resp.text}"}
        except Exception as e:
            logger.warning(f"Ollama vision request failed: {e}")
            return {"success": False, "error": str(e), "response": ""}
