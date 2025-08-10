import requests
from app.models.webhooks import WebhookRecipient
from app.models.jobs import Job
from typing import Any

def send_webhook(webhook: WebhookRecipient, summary: dict, job: Job):
    """Sends a report summary via webhook to the given recipient."""

    url = webhook.url.strip()
    if not url:
        raise ValueError(f"skipped|Webhook URL is empty for {webhook.name} ({webhook.type})")
    payload = build_payload(webhook, summary, job)

    if not summary:
        Exception("Summary is empty")

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
        raise Exception(f"Webhook failed for {webhook.name} ({webhook.type}): {e}")


def build_payload(webhook: WebhookRecipient, summary: dict, job: Job) -> dict:
    """Generates the webhook message payload based on the webhook type."""

    # Fallback title/summary
    title = f"📊 Umami Report: {job.name}"

    if webhook.type == "SLACK":
        return {
            "text": f"{title}\nVisitors: {summary.get('pageviews')} | Unique: {summary.get('uniques')}"
        }

    elif webhook.type == "DISCORD":
        return summary

    elif webhook.type == "MS_TEAMS":
        return {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "summary": title,
            "sections": [{
                "activityTitle": title,
                "facts": [
                    {"name": "Visitors", "value": str(summary.get("pageviews"))},
                    {"name": "Unique", "value": str(summary.get("uniques"))},
                ]
            }]
        }

    else:  # CUSTOM – send raw summary
        return {
            "summary": summary,
            "job": {
                "id": job.id,
                "name": job.name,
                "website_id": job.website_id,
                "report_type": job.report_type
            }
        }