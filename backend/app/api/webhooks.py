from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.webhooks import WebhookRecipient
from app.schemas.webhooks import WebhookRecipientCreate, WebhookRecipientUpdate, WebhookRecipientOut
from app.services.webhook import send_test_webhook

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/test")
def test_webhook(data: WebhookRecipientCreate):
    try:
        send_test_webhook(data)
        return {"success": True, "message": "Connection successful"}
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[WebhookRecipientOut])
def list_webhooks(db: Session = Depends(get_db)):
    return db.query(WebhookRecipient).order_by(WebhookRecipient.name).all()


@router.post("/", response_model=WebhookRecipientOut)
def create_webhook(webhook: WebhookRecipientCreate, db: Session = Depends(get_db)):
    db_webhook = WebhookRecipient(**webhook.dict())
    db.add(db_webhook)
    db.commit()
    db.refresh(db_webhook)
    return db_webhook


@router.get("/{webhook_id}", response_model=WebhookRecipientOut)
def get_webhook(webhook_id: int, db: Session = Depends(get_db)):
    webhook = db.query(WebhookRecipient).get(webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return webhook


@router.put("/{webhook_id}", response_model=WebhookRecipientOut)
def update_webhook(webhook_id: int, data: WebhookRecipientUpdate, db: Session = Depends(get_db)):
    webhook = db.query(WebhookRecipient).get(webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(webhook, key, value)

    db.commit()
    db.refresh(webhook)
    return webhook


@router.delete("/{webhook_id}")
def delete_webhook(webhook_id: int, db: Session = Depends(get_db)):
    webhook = db.query(WebhookRecipient).get(webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    db.delete(webhook)
    db.commit()
    return {"success": True}