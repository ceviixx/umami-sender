import requests
from app.schemas.webhooks import WebhookRecipientCreate
from sqlalchemy.orm import Session

def send_test_webhook(data: WebhookRecipientCreate):
    url = data.url
    payload = build_payload(data)
    try:
        response = requests.post(
            url,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "UmamiSender/1.0 (+https://github.com/ceviixx/UmamiSender)"
            },
            timeout=10
        )
        response.raise_for_status()
    except Exception as e:
        raise Exception(f"Webhook failed for {data.name} ({data.type}): {e}")

def build_payload(webhook: WebhookRecipientCreate) -> dict:
    """Generates the webhook message payload based on the webhook type."""

    # Fallback title/summary
    title = f"Test UmamiSender"

    if webhook.type == "SLACK":
        return {
            "text": f"Test Message"
        }

    elif webhook.type == "DISCORD":
        return {
            "username": "UmamiSender",
            "avatar_url": "https://github.com/ceviixx/UmamiSender/blob/9b077046e4e35113f70591071d9447150536c6cb/frontend/public/umamisender.png",
            "content": "Test message",
            "embeds": [],
            "attachments": []
        }

    elif webhook.type == "MS_TEAMS":
        return {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "summary": title,
            "sections": [{
                "activityTitle": title,
                "facts": [
                    {"name": "Visitors", "value": ""},
                    {"name": "Unique", "value": ""},
                ]
            }]
        }

    else:  # CUSTOM – send raw summary
        return {
            "summary": "",
            "job": {
                "id": "",
                "name": "",
                "website_id": "",
                "report_type": ""
            }
        }