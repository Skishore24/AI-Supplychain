from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from db.session import get_db
from core.deps import get_current_user
from models.user import User
from models.ai import AIJob

router = APIRouter(prefix="/jobs", tags=["AI Background Jobs"])

class AIJobResponse(BaseModel):
    id: int
    job_type: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    created_by: Optional[str] = None
    created_at: datetime

@router.get("", response_model=List[AIJobResponse])
def list_jobs(
    status: Optional[str] = None,
    job_type: Optional[str] = None,
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List AI and ML background jobs with execution telemetry.
    """
    query = db.query(AIJob)
    if status:
        query = query.filter(AIJob.status == status.upper())
    if job_type:
        query = query.filter(AIJob.job_type == job_type)
    
    jobs = query.order_by(AIJob.created_at.desc()).offset(offset).limit(limit).all()
    return [
        AIJobResponse(
            id=j.id,
            job_type=j.job_type,
            status=j.status,
            started_at=j.started_at,
            completed_at=j.completed_at,
            error=j.error,
            result=j.result,
            created_by=j.created_by,
            created_at=j.created_at
        )
        for j in jobs
    ]

@router.get("/{job_id}", response_model=AIJobResponse)
def get_job_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(AIJob).filter(AIJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    return AIJobResponse(
        id=job.id,
        job_type=job.job_type,
        status=job.status,
        started_at=job.started_at,
        completed_at=job.completed_at,
        error=job.error,
        result=job.result,
        created_by=job.created_by,
        created_at=job.created_at
    )

@router.post("/{job_id}/cancel")
def cancel_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(AIJob).filter(AIJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    if job.status in ["COMPLETED", "FAILED"]:
        return {"status": "error", "message": f"Job {job_id} already finished with status {job.status}."}
    
    job.status = "CANCELLED"
    job.completed_at = datetime.now()
    db.commit()
    return {"status": "success", "message": f"Job {job_id} marked as CANCELLED."}
