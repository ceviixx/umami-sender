from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_UTM"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Umami Summary Report</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f7fa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #333;
    }
    .container {
      max-width: 640px;
      margin: 40px auto;
      background-color: #fff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
    }
    .header img {
      width: 30px;
      height: 30px;
    }
    .header h1 {
      font-size: 22px;
      color: #2563eb;
      margin: 0;
    }
    h2 {
      font-size: 18px;
      margin: 20px 0 10px;
      color: #111827;
    }
    p {
      margin: 4px 0 10px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background-color: #f9fafb;
      color: #111827;
      font-weight: 600;
    }
    td {
      color: #374151;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      margin: 40px 0 20px;
    }
    a {
      color: #6b7280;
      text-decoration: none;
    }
  </style>
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
    {% if summary.result.utm_source %}
      <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
        {% for value, count in summary.result.utm_source.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
      </table>
    {% else %}
      <p>No data</p>
    {% endif %}

    <h2>Medium</h2>
    {% if summary.result.utm_medium %}
      <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
        {% for value, count in summary.result.utm_medium.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
      </table>
    {% else %}
      <p>No data</p>
    {% endif %}
    
    <h2>Campaign</h2>
    {% if summary.result.utm_campaign %}
      <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
        {% for value, count in summary.result.utm_campaign.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
      </table>
    {% else %}
      <p>No data</p>
    {% endif %}

    <h2>Term</h2>
    {% if summary.result.utm_term %}
      <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
        {% for value, count in summary.result.utm_term.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
      </table>
    {% else %}
      <p>No data</p>
    {% endif %}

    <h2>Content</h2>
    {% if summary.result.utm_content %}
      <table>
        <tr><th></th><th style="width: 100px;">Views</th></tr>
        {% for value, count in summary.result.utm_content.items() %}
          <tr>
            <td>{{ value }}</td>
            <td>{{ count }}</td>
          </tr>
        {% endfor %}
      </table>
    {% else %}
      <p>No data</p>
    {% endif %}


  </div>
  <div class="footer">
    Sent with <a href="https://github.com/ceviixx/UmamiSender">UmamiSender</a>
  </div>
</body>
</html>"""

TEMPLATE_EXAMPLE = {
    "summary": {
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

