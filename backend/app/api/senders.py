from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.sender import SenderCreate, SenderOut, SenderUpdate
from app.models.sender import Sender
from app.services.smtp import test_smtp_connection
from app.database import get_db

router = APIRouter(prefix="/senders", tags=["senders"])

@router.post("/test")
def test_sender(data: SenderCreate):
    try:
        test_smtp_connection(data)
        return {"success": True, "message": "Connection successful"}
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=SenderOut)
def create_sender(data: SenderCreate, db: Session = Depends(get_db)):
    sender = Sender(**data.dict())
    db.add(sender)
    db.commit()
    db.refresh(sender)
    return sender

@router.get("/", response_model=list[SenderOut])  # 👈 HIER
def list_senders(db: Session = Depends(get_db)):
    return db.query(Sender).all()

@router.delete("/{sender_id}")
def delete_webhook(sender_id: int, db: Session = Depends(get_db)):
    sender = db.query(Sender).get(sender_id)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    db.delete(sender)
    db.commit()
    return {"success": True}

@router.get("/{sender_id}", response_model=SenderOut)
def get_sender(sender_id: int, db: Session = Depends(get_db)):
    sender = db.query(Sender).get(sender_id)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    return sender

@router.put("/{sender_id}", response_model=SenderOut)
def update_sender(sender_id: int, data: SenderUpdate, db: Session = Depends(get_db)):
    sender = db.query(Sender).get(sender_id)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(sender, key, value)

    db.commit()
    db.refresh(sender)
    return sender