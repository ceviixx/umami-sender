from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.schemas.sender import SenderCreate, SenderOut, SenderUpdate
from app.models.sender import Sender
from app.services.smtp import test_smtp_connection
from app.database import get_db
from app.utils.responses import send_status_response

from app.utils.security import Security

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

@router.post("", response_model=SenderOut)
def create_sender(request: Request, data: SenderCreate, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    try:
        sender = Sender(**data.dict(), user_id=user.id)
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

@router.get("", response_model=list[SenderOut])  # 👈 HIER
def list_senders(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    return db.query(Sender).filter(Sender.user_id == user.id).all()

@router.delete("/{mailer_id}")
def delete_webhook(request: Request, mailer_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    sender = db.query(Sender).get(mailer_id)
    if not sender:
        return send_status_response(
            code="DELETE_FAILED",
            message="Cannot delete: mailer not found",
            status=404,
            detail=f"Mailer with id {mailer_id} does not exist."
        )
    
    if sender.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Cannot delete: unauthorized",
            status=403,
            detail=f"User {user.id} is not the owner of instance {mailer_id}."
        )

    db.delete(sender)
    db.commit()
    return {"success": True}

@router.get("/{mailer_id}", response_model=SenderOut)
def get_sender(request: Request, mailer_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    sender = db.query(Sender).get(mailer_id)
    if not sender:
        return send_status_response(
            code="MAILER_NOT_FOUND",
            message="Mailer not found",
            status=404,
            detail=f"No mailer with id {mailer_id} exists."
        )
    
    if sender.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to sender",
            status=403,
            detail=f"User {user.id} is not allowed to access sender {mailer_id}."
        )

    return sender

@router.put("/{mailer_id}", response_model=SenderOut)
def update_sender(request: Request, mailer_id: str, data: SenderUpdate, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    sender = db.query(Sender).get(mailer_id)
    if not sender:
        return send_status_response(
            code="UPDATE_FAILED",
            message="Cannot update: sender not found",
            status=404,
            detail=f"Sender with id {mailer_id} does not exist."
        )
    
    if sender.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to sender",
            status=403,
            detail=f"User {user.id} is not allowed to update sender {mailer_id}."
        )

    for key, value in data.dict(exclude_unset=True).items():
        setattr(sender, key, value)

    db.commit()
    db.refresh(sender)
    return sender