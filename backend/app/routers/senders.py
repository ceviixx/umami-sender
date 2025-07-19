from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sender import Sender
from app.schemas.sender import SenderCreate, SenderResponse

router = APIRouter()

@router.post("/", response_model=SenderResponse)
def create_sender(sender: SenderCreate, db: Session = Depends(get_db)):
    db_sender = Sender(**sender.dict())
    db.add(db_sender)
    db.commit()
    db.refresh(db_sender)
    return db_sender

@router.get("/", response_model=list[SenderResponse])
def list_senders(db: Session = Depends(get_db)):
    return db.query(Sender).all()
