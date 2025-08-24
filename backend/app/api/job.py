from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.jobs import Job
from app.schemas.mailer import MailerJobCreate, MailerJobOut, MailerJobUpdate
from app.utils.responses import send_status_response

from app.utils.security import authenticated_user, ensure_is_owner, not_found_response
from app.models.user import User

router = APIRouter(prefix="/job", tags=["job"])

@router.post("", response_model=MailerJobOut)
def create_mailer_job(
    data: MailerJobCreate, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    job = Job(**data.dict(), user_id=user.id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("", response_model=list[MailerJobOut])
def list_mailer_jobs(
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    return (db.query(Job)
            .filter(Job.user_id == user.id)
            .order_by(Job.created_at.desc())
            .all())

@router.delete("/{id}")
def delete_mailer_job(
    id: str, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    job = db.query(Job).filter(Job.id == id).first()

    if not job: return not_found_response(Job, id)
    
    ensure_is_owner(job.user_id, user)

    db.delete(job)
    db.commit()
    return {"success": True}

@router.get("/{id}", response_model=MailerJobOut)
def get_mailer_job(
    id: str, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    job = db.query(Job).filter(Job.id == id).first()

    if not job: return not_found_response(Job, id)
    
    ensure_is_owner(job.user_id, user)
    
    return job

@router.put("/{id}", response_model=MailerJobOut)
def update_mailer_job(
    id: str, 
    data: MailerJobUpdate, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    job = db.query(Job).filter(Job.id == id).first()

    if not job: return not_found_response(Job, id)
    
    ensure_is_owner(job.user_id, user)

    for key, value in data.dict().items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return job

@router.put("/{id}/status")
def update_mailer_job(
    id: str, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    job = db.query(Job).filter(Job.id == id).first()

    if not job: return not_found_response(Job, id)
    
    ensure_is_owner(job.id, user)
    
    job.is_active = not job.is_active
    db.commit()
    db.refresh(job)

    return {"is_active": job.is_active}


from datetime import datetime
from app.core.jobs import process_jobs
@router.post("/{id}/run")
def run_job(
    id: str, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    job = db.query(Job).filter(Job.id == id).first()

    if not job: return not_found_response(Job, id)
    
    ensure_is_owner(job.user_id, user)
    
    now = datetime.utcnow()
    process_jobs(db=db, jobs=[job], today=now, force_send=True)

    return send_status_response(
        code="JOB_QUEUED",
        message="Job successfully queued for execution.",
        status=202,
        detail=f"Job with id {id} has been enqueued and will run shortly."
    )
