import uuid
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Type
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.core.security import ROLE_SUPER_ADMIN, ROLE_ORG_ADMIN, ROLE_MANAGER, ROLE_ANALYST, ROLE_USER

logger = logging.getLogger("agents.base")

class AgentContext(BaseModel):
    """Execution context injected into every agent run."""
    organization_id: int = 1
    user_id: Optional[int] = None
    user_email: str = "user@emox.ai"
    user_role: str = ROLE_USER
    trace_id: str = Field(default_factory=lambda: f"tr-{uuid.uuid4().hex[:10]}")
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        arbitrary_types_allowed = True

class AgentResult(BaseModel):
    """Canonical structured result returned by every specialized agent."""
    success: bool = True
    agent_name: str
    summary: str
    data: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = 0.85
    error: Optional[str] = None
    trace: Dict[str, Any] = Field(default_factory=dict)

class BaseAgent(ABC):
    """
    Canonical Base Agent Interface:
    - Typed input/output schemas
    - Registered domain tools
    - Identity, system instructions, and permission levels
    - Tracing and error containment
    """

    name: str = "BaseAgent"
    description: str = "Base agent description"
    responsibility: str = "General reasoning"
    input_schema: Optional[Type[BaseModel]] = None
    output_schema: Optional[Type[BaseModel]] = None
    tools: List[AITool] = []
    allowed_roles: List[str] = [ROLE_SUPER_ADMIN, ROLE_ORG_ADMIN, ROLE_MANAGER, ROLE_ANALYST, ROLE_USER]
    timeout_seconds: int = 45
    max_retries: int = 2

    def __init__(self):
        self.logger = logging.getLogger(f"agents.{self.name}")

    def check_permissions(self, context: AgentContext) -> bool:
        user_role = context.user_role.upper()
        if user_role == ROLE_SUPER_ADMIN:
            return True
        return user_role in [r.upper() for r in self.allowed_roles]

    def validate_inputs(self, **kwargs) -> Dict[str, Any]:
        if self.input_schema:
            validated = self.input_schema.model_validate(kwargs)
            return validated.model_dump()
        return kwargs

    def call_tool(
        self,
        tool: AITool,
        db: Session,
        context: AgentContext,
        **kwargs
    ) -> Dict[str, Any]:
        start = datetime.now(timezone.utc)
        tool_res = tool.execute(db=db, user=None, organization_id=context.organization_id, **kwargs)
        duration_ms = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)
        return {
            "tool_name": tool.name,
            "inputs": kwargs,
            "output": tool_res,
            "duration_ms": duration_ms
        }

    @abstractmethod
    def run(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        """Core workflow logic implemented by specialized agent."""
        pass

    def execute_with_trace(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        start_time = datetime.now(timezone.utc)
        trace = {
            "agent": self.name,
            "trace_id": context.trace_id,
            "organization_id": context.organization_id,
            "started_at": start_time.isoformat(),
            "status": "RUNNING",
            "tool_calls": [],
            "duration_ms": 0
        }

        if not self.check_permissions(context):
            return AgentResult(
                success=False,
                agent_name=self.name,
                summary=f"Access denied: User role '{context.user_role}' cannot execute {self.name}.",
                error="PERMISSION_DENIED",
                confidence=0.0,
                trace=trace
            )

        try:
            clean_inputs = self.validate_inputs(**kwargs)
            result = self.run(db, context, **clean_inputs)
            end_time = datetime.now(timezone.utc)
            duration_ms = int((end_time - start_time).total_seconds() * 1000)

            trace["status"] = "COMPLETED"
            trace["completed_at"] = end_time.isoformat()
            trace["duration_ms"] = duration_ms
            result.trace = trace
            return result

        except Exception as ex:
            end_time = datetime.now(timezone.utc)
            duration_ms = int((end_time - start_time).total_seconds() * 1000)
            self.logger.error(f"Execution error in {self.name}: {ex}", exc_info=True)
            trace["status"] = "FAILED"
            trace["error"] = str(ex)
            trace["duration_ms"] = duration_ms

            return AgentResult(
                success=False,
                agent_name=self.name,
                summary=f"Agent encountered an execution failure: {str(ex)}",
                error=str(ex),
                confidence=0.0,
                trace=trace
            )
