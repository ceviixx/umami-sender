# app/api/dashboard.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sender import Sender
from app.models.umami import Umami
from app.models.mailer import MailerJob
from app.models.webhooks import WebhookRecipient

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    senders_count = db.query(Sender).count()
    umami_count = db.query(Umami).count()
    jobs_count = db.query(MailerJob).count()
    webhooks_count = db.query(WebhookRecipient).count()

    return {
        "senders": senders_count,
        "umami": umami_count,
        "jobs": jobs_count,
        "webhooks": webhooks_count,
    }