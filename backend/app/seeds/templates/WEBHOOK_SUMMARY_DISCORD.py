from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "WEBHOOK_SUMMARY_DISCORD"

TEMPLATE_CONTENT = """{
  "content": null,
  "embeds": [
    {
      "title": "Umami Summary Report",
      "description": "Here’s your summary with key metrics.\n\nReport: **{{ summary.name }}**\nPeriod: **{{ summary.period }}**",
      "color": 5814783,
      "fields": [
        {
          "name": "Views",
          "value": "{{ summary.stats.pageviews }}",
          "inline": true
        },
        {
          "name": "Visits",
          "value": "{{ summary.stats.visits }}",
          "inline": true
        },
        {
          "name": "Visitors",
          "value": "{{ summary.stats.visitors }}",
          "inline": true
        },
        {
          "name": "Bounce rate",
          "value": "{{ summary.stats.bounces }}",
          "inline": true
        },
        {
          "name": "Visit duration",
          "value": "{{ summary.stats.totaltime }}",
          "inline": true
        }
      ],
      "footer": {
        "text": "Sent with UmamiSender"
      }
    }
  ],
  "username": "Umami Sender",
  "attachments": []
}"""

TEMPLATE_EXAMPLE = {
    "summary": {
        "embedded_logo": "",
        "name": "Newsletter Monthly",
        "period": "2025-07-01 - 2025-08-01",
        "stats": {
            "pageviews": "4.39k",
            "visits": "1.8k",
            "visitors": "1.5k",
            "bounces": "65%",
            "totaltime": "2m"
        },
        "metrics": {
            "url": [
                {
                    "x": "/",
                    "y": 1156
                },
                {
                    "x": "/pricing",
                    "y": 258
                },
                {
                    "x": "/docs",
                    "y": 212
                },
                {
                    "x": "/blog/what-is-coming-in-umami-v3",
                    "y": 159
                },
                {
                    "x": "/docs/install",
                    "y": 120
                }
            ],
            "referrer": [
                {
                    "x": "google.com",
                    "y": 350
                },
                {
                    "x": "qiita.com",
                    "y": 45
                },
                {
                    "x": "duckduckgo.com",
                    "y": 36
                },
                {
                    "x": "chatgpt.com",
                    "y": 25
                },
                {
                    "x": "t.co",
                    "y": 18
                }
            ],
            "channel": [
                {
                    "x": "direct",
                    "y": 860
                },
                {
                    "x": "organicSearch",
                    "y": 456
                },
                {
                    "x": "organicSocial",
                    "y": 31
                },
                {
                    "x": "referral",
                    "y": 1
                },
                {
                    "x": "paidAds",
                    "y": 1
                }
            ],
            "browser": [
                {
                    "x": "chrome",
                    "y": 961
                },
                {
                    "x": "firefox",
                    "y": 213
                },
                {
                    "x": "safari",
                    "y": 93
                },
                {
                    "x": "ios",
                    "y": 88
                },
                {
                    "x": "edge-chromium",
                    "y": 73
                },
                {
                    "x": "crios",
                    "y": 27
                }
            ]
        }
    }
}

def seed():
    db: Session = SessionLocal()

    template = db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first()

    if template:
        # Always update example_content
        template.example_content = TEMPLATE_EXAMPLE or None

        if not template.is_customized:
            print(f"♻️ Updating default template for {SENDER_TYPE} (not customized)...")
            template.content = TEMPLATE_CONTENT.strip() or None
        else:
            print(f"⛔️ Default template for {SENDER_TYPE} has been customized – skipping content update.")

        db.commit()

    else:
        print(f"🌱 Seeding new default template for {SENDER_TYPE}...")
        new_template = MailTemplate(
            type="default",
            sender_type=SENDER_TYPE,
            content=TEMPLATE_CONTENT.strip() or None,
            example_content=TEMPLATE_EXAMPLE or None
        )
        db.add(new_template)
        db.commit()

    db.close()

