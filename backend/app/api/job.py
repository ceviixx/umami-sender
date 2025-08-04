from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.jobs import Job
from app.schemas.mailer import MailerJobCreate, MailerJobOut, MailerJobUpdate
from app.utils.responses import send_status_response

router = APIRouter(prefix="/job", tags=["job"])

@router.post("/", response_model=MailerJobOut)
def create_mailer_job(data: MailerJobCreate, db: Session = Depends(get_db)):
    job = Job(**data.dict())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/", response_model=list[MailerJobOut])
def list_mailer_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

@router.delete("/{job_id}")
def delete_mailer_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
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
def get_mailer_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return send_status_response(
            code="JOB_NOT_FOUND",
            message="Job not found",
            status=404,
            detail=f"No job with id {job_id} exists."
        )
    return job

@router.put("/{job_id}", response_model=MailerJobOut)
def update_mailer_job(job_id: int, data: MailerJobUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
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