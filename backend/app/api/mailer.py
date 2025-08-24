from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.sender import SenderCreate, SenderOut, SenderUpdate
from app.models.sender import Sender
from app.services.smtp import test_smtp_connection
from app.database import get_db
from app.utils.responses import send_status_response

from app.utils.security import authenticated_user, ensure_is_owner, not_found_response
from app.models.user import User

router = APIRouter(prefix="/mailer", tags=["mailer"])

@router.post("/test")
def test_sender(
    data: SenderCreate, 
    _user: User = Depends(authenticated_user)
):
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
def create_sender(
    data: SenderCreate, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
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
def list_senders(
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    return (db.query(Sender)
            .filter(Sender.user_id == user.id)
            .order_by(Sender.created_at.desc())
            .all())

@router.delete("/{id}")
def delete_webhook(
    id: str, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    sender = db.query(Sender).get(id)

    if not sender: return not_found_response(Sender, id)
    
    ensure_is_owner(sender.user_id, user)

    db.delete(sender)
    db.commit()
    return {"success": True}

@router.get("/{id}", response_model=SenderOut)
def get_sender(
    id: str, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    sender = db.query(Sender).get(id)
    
    if not sender: return not_found_response(Sender, id)
    
    ensure_is_owner(sender.user_id, user)

    return sender

@router.put("/{id}", response_model=SenderOut)
def update_sender(
    id: str, 
    data: SenderUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    sender = db.query(Sender).get(id)
    
    if not sender: return not_found_response(Sender, id)
    
    ensure_is_owner(sender.user_id, user)

    for key, value in data.dict(exclude_unset=True).items():
        setattr(sender, key, value)

    db.commit()
    db.refresh(sender)
    return sender