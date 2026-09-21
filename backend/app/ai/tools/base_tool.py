import logging
from enum import Enum
from typing import Dict, Any, Optional, List, Type
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import ROLE_SUPER_ADMIN, ROLE_ORG_ADMIN, ROLE_MANAGER, ROLE_ANALYST, ROLE_USER
from app.services.audit_service import log_audit_event

logger = logging.getLogger("ai.tools")

class ToolPermissionLevel(str, Enum):
    READ = "READ"
    WRITE = "WRITE"
    ADMIN = "ADMIN"

class AITool:
    """
    Standardized, Secure Tool Interface for AI Supply Chain Agents:
    - Explicit permission classification: READ, WRITE, ADMIN
    - Input & output validation via Pydantic
    - Automatic tenant scoping and user authorization
    - Execution timeout and error containment
    - Immutable audit trail generation on mutations
    """

    name: str = "base_tool"
    description: str = "Base tool interface description"
    input_schema: Optional[Type[BaseModel]] = None
    output_schema: Optional[Type[BaseModel]] = None
    permission_level: ToolPermissionLevel = ToolPermissionLevel.READ
    timeout: int = 30  # seconds

    def check_authorization(self, user: Optional[Any] = None) -> bool:
        if self.permission_level == ToolPermissionLevel.READ:
            return True  # Read tools accessible to all authenticated/configured contexts

        if not user:
            return False

        user_role = getattr(user, "role", ROLE_USER).upper()

        if user_role == ROLE_SUPER_ADMIN:
            return True

        if self.permission_level == ToolPermissionLevel.WRITE:
            return user_role in [ROLE_ORG_ADMIN, ROLE_MANAGER, "ADMIN", "MANAGER"]

        if self.permission_level == ToolPermissionLevel.ADMIN:
            return user_role in [ROLE_SUPER_ADMIN, ROLE_ORG_ADMIN, "ADMIN"]

        return False

    def validate_inputs(self, **kwargs) -> Dict[str, Any]:
        if self.input_schema:
            validated = self.input_schema.model_validate(kwargs)
            return validated.model_dump()
        return kwargs

    def audit_execution(
        self,
        db: Session,
        user: Optional[Any],
        organization_id: int,
        action: str,
        entity: str,
        entity_id: Any,
        details: Dict[str, Any]
    ) -> None:
        user_email = getattr(user, "email", "ai_agent@emox.ai")
        log_audit_event(
            db=db,
            user_email=user_email,
            action=action,
            entity=entity,
            entity_id=str(entity_id),
            new_state=details
        )

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("Each tool must implement the execute method.")
