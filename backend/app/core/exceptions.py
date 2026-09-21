from typing import Any, Dict, Optional

class AppException(Exception):
    """Base application exception with structured error code and status code."""
    status_code: int = 500
    code: str = "INTERNAL_SERVER_ERROR"

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None, status_code: Optional[int] = None, code: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}
        if status_code:
            self.status_code = status_code
        if code:
            self.code = code

class NotFoundError(AppException):
    status_code = 404
    code = "NOT_FOUND"

class UnauthorizedError(AppException):
    status_code = 401
    code = "UNAUTHORIZED"

class ForbiddenError(AppException):
    status_code = 403
    code = "FORBIDDEN"

class TenantMismatchError(AppException):
    status_code = 403
    code = "TENANT_ACCESS_DENIED"

class ValidationError(AppException):
    status_code = 422
    code = "VALIDATION_ERROR"

class ConflictError(AppException):
    status_code = 409
    code = "CONFLICT"

class RateLimitError(AppException):
    status_code = 429
    code = "RATE_LIMIT_EXCEEDED"

class AgentExecutionError(AppException):
    status_code = 502
    code = "AI_AGENT_EXECUTION_FAILED"
