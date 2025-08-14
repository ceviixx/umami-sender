import requests
from app.schemas.webhooks import WebhookRecipientCreate
from sqlalchemy.orm import Session
from app.utils.responses import send_status_response
from requests.exceptions import HTTPError, RequestException

def send_test_webhook(data: WebhookRecipientCreate) -> None:
    url = data.url
    payload = build_payload(data)

    try:
        resp = requests.post(
            url,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "UmamiSender/1.0 (+https://github.com/ceviixx/umami-sender)"
            },
            timeout=10
        )
        resp.raise_for_status()
    except HTTPError as e:
        status = e.response.status_code if e.response is not None else 502
        body   = e.response.text if e.response is not None else ""
        raise RuntimeError(f"{status} {getattr(e.response, 'reason', '')} {body}".strip())
    except RequestException as e:
        raise RuntimeError(str(e))

def build_payload(webhook: WebhookRecipientCreate) -> dict:
    """Generates the webhook message payload based on the webhook type."""

    title = f"Test UmamiSender"

    if webhook.type == "SLACK":
        return {
            "text": f"Test Message"
        }

    elif webhook.type == "DISCORD":
        return {
            "username": "UmamiSender",
            "avatar_url": "https://github.com/ceviixx/umami-sender/blob/9b077046e4e35113f70591071d9447150536c6cb/frontend/public/umamisender.png",
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

    else:
        return {
            "summary": "",
            "job": {
                "id": "",
                "name": "",
                "website_id": "",
                "report_type": ""
            }
        }