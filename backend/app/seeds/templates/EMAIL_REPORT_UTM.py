from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_UTM"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMAIL_REPORT_UTM</title>
  <style>{{ inline_css | safe }}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{ summary.embedded_logo }}" alt="Logo" />
      <h1>UmamiSender</h1>
    </div>
    <h2>We’ve crunched the numbers – here’s your summary.</h2>
    <p><strong>Report:</strong> {{ summary.name }}</p>
    <p><strong>Period:</strong> {{ summary.period }}</p>


    <h2>Source</h2>
    <table>
      <tr><th></th><th style="width: 100px;">Views</th></tr>
      {% if summary.result.utm_source %}
      {% for value, count in summary.result.utm_source.items() %}
        <tr>
          <td>{{ value }}</td>
          <td>{{ count }}</td>
        </tr>
      {% endfor %}
    {% endif %}
    </table>
    

    <h2>Medium</h2>
    <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
         {% if summary.result.utm_medium %}
      {% for value, count in summary.result.utm_medium.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
    {% endif %}
    </table>
   
    
    <h2>Campaign</h2>
    <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
        {% if summary.result.utm_campaign %}
      {% for value, count in summary.result.utm_campaign.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
    {% endif %}
      </table>
    

    <h2>Term</h2>
    <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
        {% if summary.result.utm_term %}
      {% for value, count in summary.result.utm_term.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
    {% endif %}
      </table>
    

    <h2>Content</h2>
    <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
        {% if summary.result.utm_content %}
      {% for value, count in summary.result.utm_content.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
    {% endif %}
      </table>
    


  </div>
  <div class="footer">
    Sent with <a href="https://github.com/ceviixx/UmamiSender">UmamiSender</a>
  </div>
</body>
</html>"""

TEMPLATE_EXAMPLE = {
    "summary": {
        "name": "UTM",
        "period": "Last 90 days",
        "type": "utm",
        "result": {
            "utm_source": {
                "coolify.io": 1012,
                "chatgpt.com": 206,
                "openalternative.co": 174,
                "awesome-homelab.com": 50,
                "dopubox.com": 38
            },
            "utm_medium": {
                "referral": 107,
                "cpc": 42,
                "email": 17,
                "outbound-email": 6,
                "paid-social": 2
            },
            "utm_campaign": {
                "navigation": 52,
                "website_analytics": 37,
                "website-analytics": 6,
                "newsletter-issue-102": 5,
                "devkit": 5
            },
            "utm_content": {
                "website-analytics-email-2": 6,
                "insightful": 1,
                "sidebar-cta": 1
            },
            "utm_term": {},
            "utm_agid": {},
            "utm_banner": {
                "6673263": 1,
                "1761521953": 1,
                "8631802": 1,
                "2225639": 1,
                "8124433": 1
            }
        },
        "embedded_logo": ""
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

