from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "WEBHOOK_SUMMARY_DISCORD"

TEMPLATE_MAIL = """
"""

TEMPLATE_WEBHOOK = """{
  "username": "UmamiSender",
  "avatar_url": "https://github.com/ceviixx/UmamiSender/blob/9b077046e4e35113f70591071d9447150536c6cb/frontend/public/umamisender.png",
  "content": "Latest statistics for: {{ summary.name }}",
  "embeds": [
    {
      "color": 1310975,
      "footer": {
        "text": "Timerange: {{ summary.period }}"
      },
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
      ]
    }
    {% if summary.pageviews %},
    {
      "title": "Top Pageviews",
      "color": 65535,
      "footer": {
        "text": "Only the top 5"
      },
      "fields": [
        {
          "name": "Pages",
          "value": "{% for entry in summary.pageviews %}{{ entry.x }}\\n{% endfor %}",
          "inline": true
        },
        {
          "name": "Views",
          "value": "{% for entry in summary.pageviews %}{{ entry.y }}\\n{% endfor %}",
          "inline": true
        }
      ]
    }
    {% endif %}
    {% if summary.referrers %},
    {
      "title": "Top Referrer",
      "color": 65535,
      "footer": {
        "text": "Only the top 5"
      },
      "fields": [
        {
          "name": "Pages",
          "value": "{% for entry in summary.referrers %}{{ entry.x }}\\n{% endfor %}",
          "inline": true
        },
        {
          "name": "Views",
          "value": "{% for entry in summary.referrers %}{{ entry.y }}\\n{% endfor %}",
          "inline": true
        }
      ]
    }
    {% endif %}
  ],
  "attachments": []
}"""

def seed():
    default()
    custom()

def default():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first():
        print(f"🌱 Seede Standard-{SENDER_TYPE}-Template...")
        template = MailTemplate(
            type="default",
            sender_type=SENDER_TYPE,
            description="",
            html=TEMPLATE_MAIL.strip() or None,
            json=TEMPLATE_WEBHOOK.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()

def custom():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="custom").first():
        print(f"🌱 Seede Custom-{SENDER_TYPE}-Template...")
        template = MailTemplate(
            type="custom",
            sender_type=SENDER_TYPE,
            description="",
            html=TEMPLATE_MAIL.strip() or None,
            json=TEMPLATE_WEBHOOK.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()
