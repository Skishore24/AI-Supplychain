import logging
import json
import sys
from datetime import datetime, timezone
from typing import Any, Dict, Optional

class StructuredJSONFormatter(logging.Formatter):
    """
    Outputs structured JSON logs with contextual trace fields:
    request_id, organization_id, user_id, route, latency_ms.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Add extra fields if provided
        for key in ["request_id", "organization_id", "user_id", "route", "duration_ms", "agent", "tool", "model"]:
            if hasattr(record, key):
                log_obj[key] = getattr(record, key)

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj)

def setup_logging(log_level: str = "INFO") -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredJSONFormatter())
    
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    # Clear existing handlers
    root_logger.handlers.clear()
    root_logger.addHandler(handler)

logger = logging.getLogger("supply_chain")
