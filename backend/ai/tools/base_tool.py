from typing import Dict, Any, Optional, List, Type
from pydantic import BaseModel
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger("ai.tools")

class AITool:
    """
    Controlled interface for AI agent access to database operations.
    Enforces authorization, input validation, and audit trail generation.
    Never exposes raw SQL or shell commands to the LLM.
    """

    name: str = "base_tool"
    description: str = "Base tool description"
    input_schema: Optional[Type[BaseModel]] = None
    output_schema: Optional[Type[BaseModel]] = None
    is_write: bool = False
    requires_auth: bool = True
    allowed_roles: List[str] = ["admin", "manager"]

    def check_authorization(self, user: Optional[Any] = None) -> bool:
        if not self.requires_auth:
            return True
        if not user:
            return False
        user_role = getattr(user, "role", "user")
        return user_role in self.allowed_roles

    def execute(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("Tool execution must be implemented by subclass.")
