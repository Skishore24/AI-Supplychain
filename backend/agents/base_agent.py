import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Type
from datetime import datetime, timezone
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session

from ai.tools.base_tool import AITool

logger = logging.getLogger("agents.base")

class BaseAgent(ABC):
    """
    Standard Base Agent for the Multi-Agent Supply Chain System.
    Enforces typed schemas, tools registration, execution tracing, and error containment.
    """

    name: str = "BaseAgent"
    description: str = "Abstract agent description"
    input_schema: Optional[Type[BaseModel]] = None
    output_schema: Optional[Type[BaseModel]] = None
    tools: List[AITool] = []

    def __init__(self):
        self.logger = logging.getLogger(f"agents.{self.name}")

    def validate_inputs(self, **kwargs) -> Dict[str, Any]:
        if self.input_schema:
            try:
                validated = self.input_schema.model_validate(kwargs)
                return validated.model_dump()
            except ValidationError as e:
                self.logger.error(f"Input validation error in {self.name}: {e}")
                raise ValueError(f"Invalid input parameters for {self.name}: {e}")
        return kwargs

    def validate_output(self, result: Dict[str, Any]) -> Dict[str, Any]:
        if self.output_schema:
            try:
                validated = self.output_schema.model_validate(result)
                return validated.model_dump()
            except ValidationError as e:
                self.logger.warning(f"Output schema mismatch in {self.name}: {e}. Returning raw result.")
                return result
        return result

    @abstractmethod
    def run(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        """Execute agent workflow."""
        pass

    def execute_with_trace(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        """Executes agent with execution telemetry and structured error handling."""
        start_time = datetime.now(timezone.utc)
        trace = {
            "agent_name": self.name,
            "started_at": start_time.isoformat(),
            "status": "RUNNING",
            "tools_called": [],
            "duration_ms": 0
        }

        try:
            clean_inputs = self.validate_inputs(**kwargs)
            result = self.run(db, user, **clean_inputs)
            end_time = datetime.now(timezone.utc)
            duration_ms = int((end_time - start_time).total_seconds() * 1000)

            trace["status"] = "COMPLETED"
            trace["completed_at"] = end_time.isoformat()
            trace["duration_ms"] = duration_ms

            if isinstance(result, dict):
                result["_trace"] = trace
            return result
        except Exception as ex:
            end_time = datetime.now(timezone.utc)
            duration_ms = int((end_time - start_time).total_seconds() * 1000)
            self.logger.error(f"Execution failed in {self.name}: {ex}", exc_info=True)
            trace["status"] = "FAILED"
            trace["error"] = str(ex)
            trace["duration_ms"] = duration_ms
            return {
                "success": False,
                "agent": self.name,
                "error": str(ex),
                "_trace": trace
            }
