from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.jobs import Job
from app.schemas.mailer import MailerJobCreate, MailerJobOut, MailerJobUpdate
from app.utils.responses import send_status_response

from app.utils.security import Security

router = APIRouter(prefix="/job", tags=["job"])

@router.post("", response_model=MailerJobOut)
def create_mailer_job(request: Request, data: MailerJobCreate, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    job = Job(**data.dict(), user_id=user.id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("", response_model=list[MailerJobOut])
def list_mailer_jobs(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    return (db.query(Job).
            filter(Job.user_id == user.id)
            .order_by(Job.created_at.desc())
            .all())

@router.delete("/{job_id}")
def delete_mailer_job(request: Request, job_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    job = db.query(Job).filter(Job.id == job_id).first()

    if job.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Cannot delete: unauthorized",
            status=403,
            detail=f"User {user.id} is not the owner of job {job_id}."
        )
    
    if not job:
        return send_status_response(
            code="DELETE_FAILED",
            message="Cannot delete: job not found",
            status=404,
            detail=f"Job with id {job_id} does not exist."
        )
    
    db.delete(job)
    db.commit()
    return {"success": True}

@router.get("/{job_id}", response_model=MailerJobOut)
def get_mailer_job(request: Request, job_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    job = db.query(Job).filter(Job.id == job_id).first()

    if job.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to job",
            status=403,
            detail=f"User {user.id} is not allowed to access job {job_id}."
        )
    
    if not job:
        return send_status_response(
            code="JOB_NOT_FOUND",
            message="Job not found",
            status=404,
            detail=f"No job with id {job_id} exists."
        )
    
    return job

@router.put("/{job_id}", response_model=MailerJobOut)
def update_mailer_job(request: Request, job_id: str, data: MailerJobUpdate, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    job = db.query(Job).filter(Job.id == job_id).first()

    if job.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to job",
            status=403,
            detail=f"User {user.id} is not allowed to update job {job_id}."
        )
    
    if not job:
        return send_status_response(
            code="UPDATE_FAILED",
            message="Cannot update: job not found",
            status=404,
            detail=f"Job with id {job_id} does not exist."
        )
    
    for key, value in data.dict().items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return job

@router.put("/{job_id}/status")
def update_mailer_job(request: Request, job_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    job = db.query(Job).filter(Job.id == job_id).first()

    if job.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to job",
            status=403,
            detail=f"User {user.id} is not allowed to update job {job_id}."
        )
    
    if not job:
        return send_status_response(
            code="UPDATE_FAILED",
            message="Cannot update: job not found",
            status=404,
            detail=f"Job with id {job_id} does not exist."
        )
    
    job.is_active = not job.is_active
    db.commit()
    db.refresh(job)

    return {"is_active": job.is_active}