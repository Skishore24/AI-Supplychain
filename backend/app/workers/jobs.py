import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.ai import AIJob
from app.db.session import SessionLocal

logger = logging.getLogger("workers.jobs")

class JobManager:
    """
    Background AI and Data Job Lifecycle Manager:
    Manages asynchronous tasks (QUEUED -> RUNNING -> COMPLETED / FAILED).
    """

    @staticmethod
    def create_job(
        db: Session,
        job_type: str,
        organization_id: int = 1,
        created_by: str = "system"
    ) -> AIJob:
        job = AIJob(
            job_type=job_type,
            organization_id=organization_id,
            status="QUEUED",
            created_by=created_by,
            created_at=datetime.now(timezone.utc)
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def start_job(db: Session, job_id: int) -> Optional[AIJob]:
        job = db.query(AIJob).filter(AIJob.id == job_id).first()
        if job:
            job.status = "RUNNING"
            job.started_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(job)
        return job

    @staticmethod
    def complete_job(db: Session, job_id: int, result: Dict[str, Any]) -> Optional[AIJob]:
        job = db.query(AIJob).filter(AIJob.id == job_id).first()
        if job:
            job.status = "COMPLETED"
            job.completed_at = datetime.now(timezone.utc)
            job.result = result
            db.commit()
            db.refresh(job)
        return job

    @staticmethod
    def fail_job(db: Session, job_id: int, error_message: str) -> Optional[AIJob]:
        job = db.query(AIJob).filter(AIJob.id == job_id).first()
        if job:
            job.status = "FAILED"
            job.completed_at = datetime.now(timezone.utc)
            job.error = error_message
            db.commit()
            db.refresh(job)
        return job

job_manager = JobManager()
