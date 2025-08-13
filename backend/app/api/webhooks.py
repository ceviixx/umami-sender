from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from sqlalchemy import and_, exists
from app.models.webhooks import WebhookRecipient
from app.schemas.webhooks import WebhookRecipientCreate, WebhookRecipientUpdate, WebhookRecipientOut
from app.models.jobs import Job
from app.services.webhook import send_test_webhook
from app.utils.responses import send_status_response

from app.utils.security import Security

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/test")
def test_webhook(request: Request, data: WebhookRecipientCreate):
    _ = Security(request).get_user()
    
    try:
        send_test_webhook(data)
        return {"success": True, "message": "Connection successful"}
    except RuntimeError as e:
        return send_status_response(
            code="WEBHOOK_TEST_FAILED",
            message="Webhook test failed",
            status=400,
            detail=str(e)
        )

@router.get("", response_model=list[WebhookRecipientOut])
def list_webhooks(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    return db.query(WebhookRecipient).filter(WebhookRecipient.user_id == user.id).all()

@router.post("", response_model=WebhookRecipientOut)
def create_webhook(request: Request, webhook: WebhookRecipientCreate, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    try:
        db_webhook = WebhookRecipient(**webhook.dict(), user_id=user.id)
        db.add(db_webhook)
        db.commit()
        db.refresh(db_webhook)
        return db_webhook
    except Exception as e:
        return send_status_response(
            code="CREATE_FAILED",
            message="Failed to create webhook",
            status=500,
            detail=str(e)
        )

@router.get("/{webhook_id}", response_model=WebhookRecipientOut)
def get_webhook(request: Request, webhook_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    webhook = db.query(WebhookRecipient).get(webhook_id)
    
    if webhook.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to webhook",
            status=403,
            detail=f"User {user.id} is not allowed to access webhook {webhook_id}."
        )
    
    if not webhook:
        return send_status_response(
            code="WEBHOOK_NOT_FOUND",
            message="Webhook not found",
            status=404,
            detail=f"No webhook with ID {webhook_id}"
        )
    
    return webhook

@router.put("/{webhook_id}", response_model=WebhookRecipientOut)
def update_webhook(request: Request, webhook_id: str, data: WebhookRecipientUpdate, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    webhook = db.query(WebhookRecipient).get(webhook_id)

    if webhook.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to webhook",
            status=403,
            detail=f"User {user.id} is not allowed to update webhook {webhook_id}."
        )

    if not webhook:
        return send_status_response(
            code="WEBHOOK_NOT_FOUND",
            message="Webhook not found",
            status=404,
            detail=f"No webhook with ID {webhook_id}"
        )

    for key, value in data.dict(exclude_unset=True).items():
        setattr(webhook, key, value)

    db.commit()
    db.refresh(webhook)
    return webhook

@router.delete("/{webhook_id}")
def delete_webhook(request: Request, webhook_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    webhook = db.query(WebhookRecipient).get(webhook_id)

    if webhook.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Cannot delete: unauthorized",
            status=403,
            detail=f"User {user.id} is not the owner of webhook {webhook_id}."
        )
    
    if not webhook:
        return send_status_response(
            code="WEBHOOK_NOT_FOUND",
            message="Webhook not found",
            status=404,
            detail=f"No webhook with ID {webhook_id}"
        )

    in_use = db.query(
        exists().where(
            and_(
                Job.user_id == user.id,
                Job.webhook_recipients.any(webhook_id) 
            )
        )
    ).scalar()

    if in_use:
        job_ids = [
            str(j.id) for j in db.query(Job.id)
            .filter(
                Job.user_id == user.id,
                Job.webhook_recipients.any(webhook_id)
            )
            .limit(5)
            .all()
        ]

        return send_status_response(
            code="WEBHOOK_IN_USE",
            message="Cannot delete: webhook is used by one or more jobs",
            status=409,
            detail=(
                f"Webhook {webhook_id} is referenced by existing jobs "
                f"(e.g. {', '.join(job_ids)}). Remove it from all jobs first."
            )
        )

    db.delete(webhook)
    db.commit()
    return {"success": True}