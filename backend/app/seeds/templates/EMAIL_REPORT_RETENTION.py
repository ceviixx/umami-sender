from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_RETENTION"

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

    <table>
    <tr>
        <th>Date</th>
        <th>Visitors</th>
        <th>Returning</th>
        <th>Retention</th>
    </tr>
    {% for entry in summary.result %}
    <tr>
        <td>{{ entry.date[:10] }}</td>
        <td>{{ entry.visitors }}</td>
        <td>{{ entry.returnVisitors }}</td>
        <td style="min-width: 150px; padding: 0; margin: 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border: none; padding: 0; margin: 0; width: 100%;">
                <tr>
                <td style="padding: 0; margin: 0; vertical-align: middle; width: 100%;">
                    <div style="background-color: #e5e7eb; border-radius: 4px; width: 100%; height: 12px; overflow: hidden;">
                        <div style="background-color: #10b981; width: {{ entry.percentage }}%; height: 100%;"></div>
                    </div>
                </td>
                <td style="padding: 0 0 0 8px; margin: 0; white-space: nowrap; font-size: 12px; color: #374151;">
                    {{ entry.percentage }}%
                </td>
                </tr>
            </table>
        </td>
    </tr>
    {% endfor %}
    </table>



  </div>

  <div class="footer">
    Sent with <a href="https://github.com/ceviixx/UmamiSender">UmamiSender</a>
  </div>

</body>
</html>"""

TEMPLATE_EXAMPLE = {
    "summary": {
        "type": "retention", 
        "result": [
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 0,
                "visitors": 1886,
                "returnVisitors": 1886,
                "percentage": 100
            },
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 1,
                "visitors": 1886,
                "returnVisitors": 171,
                "percentage": 9.066808059384941
            },
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 2,
                "visitors": 1886,
                "returnVisitors": 104,
                "percentage": 5.514316012725344
            },
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 3,
                "visitors": 1886,
                "returnVisitors": 79,
                "percentage": 4.188759278897137
            },
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 4,
                "visitors": 1886,
                "returnVisitors": 67,
                "percentage": 3.552492046659597
            }
        ],
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

