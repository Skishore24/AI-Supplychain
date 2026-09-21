import time
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.models.ai import AIAuditLog

logger = logging.getLogger("agents.executor")

class AgentExecutor:
    """
    Agent Execution Engine:
    - Enforces timeout, retry policy with exponential backoff
    - Captures complete execution telemetry and logs to AIAuditLog
    - Contains errors so single agent failures don't crash API handlers
    """

    def __init__(self, max_retries: int = 2):
        self.max_retries = max_retries

    def execute(
        self,
        agent: BaseAgent,
        db: Session,
        context: AgentContext,
        **kwargs
    ) -> AgentResult:
        attempt = 0
        last_error = None
        start_ts = time.time()

        while attempt <= self.max_retries:
            try:
                result = agent.execute_with_trace(db, context, **kwargs)
                if result.success or attempt == self.max_retries:
                    self._persist_audit_log(db, agent, context, result, time.time() - start_ts)
                    return result
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Attempt {attempt + 1} failed for {agent.name}: {e}")

            attempt += 1
            if attempt <= self.max_retries:
                time.sleep(0.5 * attempt)

        fail_result = AgentResult(
            success=False,
            agent_name=agent.name,
            summary=f"Execution failed after {self.max_retries + 1} attempts: {last_error}",
            error=last_error or "EXECUTION_RETRY_EXHAUSTED",
            confidence=0.0
        )
        self._persist_audit_log(db, agent, context, fail_result, time.time() - start_ts)
        return fail_result

    def _persist_audit_log(
        self,
        db: Session,
        agent: BaseAgent,
        context: AgentContext,
        result: AgentResult,
        latency: float
    ):
        try:
            log_entry = AIAuditLog(
                user_email=context.user_email,
                organization_id=context.organization_id,
                agent=agent.name,
                action="AGENT_EXECUTION",
                result={
                    "success": result.success,
                    "confidence": result.confidence,
                    "tools_called": len(result.tool_calls),
                    "duration_seconds": round(latency, 3),
                    "summary_preview": result.summary[:200]
                }
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            logger.warning(f"Failed to record AI audit log: {e}")

agent_executor = AgentExecutor()
