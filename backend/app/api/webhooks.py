from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from sqlalchemy import and_, exists
from app.models.webhooks import WebhookRecipient
from app.schemas.webhooks import WebhookRecipientCreate, WebhookRecipientUpdate, WebhookRecipientOut
from app.models.jobs import Job
from app.services.webhook import send_test_webhook
from app.utils.responses import send_status_response

from app.utils.security import authenticated_user, ensure_is_owner, not_found_response
from app.models.user import User

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/test")
def test_webhook(
    data: WebhookRecipientCreate,
    _user: User = Depends(authenticated_user)
):
    try:
        send_test_webhook(data)
        return send_status_response(
            code="OK",
            message="Connection successful",
            status=200,
            detail=None
        )
    except RuntimeError as e:
        status = 400 if str(e).lstrip().startswith(("400","401","403","404","405","409","422")) else 502
        return send_status_response(
            code="WEBHOOK_TEST_FAILED",
            message=f"Testing webhook failed for {data.name} ({data.type})",
            status=status,
            detail=str(e)
        )

@router.get("", response_model=list[WebhookRecipientOut])
def list_webhooks(
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    return (db.query(WebhookRecipient)
            .filter(WebhookRecipient.user_id == user.id)
            .order_by(WebhookRecipient.created_at.desc())
            .all())

@router.post("", response_model=WebhookRecipientOut)
def create_webhook(
    webhook: WebhookRecipientCreate, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
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

@router.get("/{id}", response_model=WebhookRecipientOut)
def get_webhook(
    id: str, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    webhook = db.query(WebhookRecipient).get(id)
    
    if not webhook: return not_found_response(WebhookRecipient, id)
    
    ensure_is_owner(webhook.user_id, user)

    return webhook

@router.put("/{id}", response_model=WebhookRecipientOut)
def update_webhook(
    id: str, 
    data: WebhookRecipientUpdate, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    webhook = db.query(WebhookRecipient).get(id)

    if not webhook: return not_found_response(WebhookRecipient, id)

    ensure_is_owner(webhook.user_id, user)

    for key, value in data.dict(exclude_unset=True).items():
        setattr(webhook, key, value)

    db.commit()
    db.refresh(webhook)
    return webhook

@router.delete("/{id}")
def delete_webhook(
    id: str, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    webhook = db.query(WebhookRecipient).get(id)

    if not webhook: return not_found_response(WebhookRecipient, id)

    ensure_is_owner(webhook.user_id, user)

    in_use = db.query(
        exists().where(
            and_(
                Job.user_id == user.id,
                Job.webhook_recipients.any(id) 
            )
        )
    ).scalar()

    if in_use:
        job_ids = [
            str(j.id) for j in db.query(Job.id)
            .filter(
                Job.user_id == user.id,
                Job.webhook_recipients.any(id)
            )
            .limit(5)
            .all()
        ]

        return send_status_response(
            code="WEBHOOK_IN_USE",
            message="Cannot delete: webhook is used by one or more jobs",
            status=409,
            detail=(
                f"Webhook {id} is referenced by existing jobs "
                f"(e.g. {', '.join(job_ids)}). Remove it from all jobs first."
            )
        )

    db.delete(webhook)
    db.commit()
    return {"success": True}