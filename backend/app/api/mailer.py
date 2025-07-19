from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.mailer import MailerJob
from app.schemas.mailer import MailerJobCreate, MailerJobOut, MailerJobUpdate

router = APIRouter(prefix="/mailer", tags=["mailer"])

@router.post("/", response_model=MailerJobOut)
def create_mailer_job(data: MailerJobCreate, db: Session = Depends(get_db)):
    job = MailerJob(**data.dict())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/", response_model=list[MailerJobOut])
def list_mailer_jobs(db: Session = Depends(get_db)):
    return db.query(MailerJob).all()

@router.delete("/{job_id}")
def delete_mailer_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(MailerJob).filter(MailerJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Mailer Job nicht gefunden")
    db.delete(job)
    db.commit()
    return {"success": True}

@router.get("/{job_id}", response_model=MailerJobOut)
def get_mailer_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(MailerJob).filter(MailerJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    return job

@router.put("/{job_id}", response_model=MailerJobOut)
def update_mailer_job(job_id: int, data: MailerJobUpdate, db: Session = Depends(get_db)):
    job = db.query(MailerJob).filter(MailerJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    for key, value in data.dict().items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return job