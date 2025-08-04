from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.sender import SenderCreate, SenderOut, SenderUpdate
from app.models.sender import Sender
from app.services.smtp import test_smtp_connection
from app.database import get_db
from app.utils.responses import send_status_response

router = APIRouter(prefix="/mailer", tags=["mailer"])

@router.post("/test")
def test_sender(data: SenderCreate):
    try:
        test_smtp_connection(data)
        return {"success": True, "message": "Connection successful"}
    except RuntimeError as e:
        return send_status_response(
            code="SMTP_TEST_FAILED",
            message="SMTP connection failed",
            status=400,
            detail=str(e)
        )

@router.post("/", response_model=SenderOut)
def create_sender(data: SenderCreate, db: Session = Depends(get_db)):
    try:
        sender = Sender(**data.dict())
        db.add(sender)
        db.commit()
        db.refresh(sender)
        return sender
    except Exception as e:
        return send_status_response(
            code="CREATE_FAILED",
            message="Failed to create mailer",
            status=500,
            detail=str(e)
        )

@router.get("/", response_model=list[SenderOut])  # 👈 HIER
def list_senders(db: Session = Depends(get_db)):
    return db.query(Sender).all()

@router.delete("/{sender_id}")
def delete_webhook(sender_id: int, db: Session = Depends(get_db)):
    sender = db.query(Sender).get(sender_id)
    if not sender:
        return send_status_response(
            code="DELETE_FAILED",
            message="Cannot delete: mailer not found",
            status=404,
            detail=f"Mailer with id {sender_id} does not exist."
        )
    db.delete(sender)
    db.commit()
    return {"success": True}

@router.get("/{sender_id}", response_model=SenderOut)
def get_sender(sender_id: int, db: Session = Depends(get_db)):
    sender = db.query(Sender).get(sender_id)
    if not sender:
        return send_status_response(
            code="MAILER_NOT_FOUND",
            message="Mailer not found",
            status=404,
            detail=f"No mailer with id {sender_id} exists."
        )
    return sender

@router.put("/{sender_id}", response_model=SenderOut)
def update_sender(sender_id: int, data: SenderUpdate, db: Session = Depends(get_db)):
    sender = db.query(Sender).get(sender_id)
    if not sender:
        return send_status_response(
            code="UPDATE_FAILED",
            message="Cannot update: sender not found",
            status=404,
            detail=f"Sender with id {sender_id} does not exist."
        )

    for key, value in data.dict(exclude_unset=True).items():
        setattr(sender, key, value)

    db.commit()
    db.refresh(sender)
    return sender