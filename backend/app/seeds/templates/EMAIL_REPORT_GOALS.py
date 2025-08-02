from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_GOALS"

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

    <h2>Your summary for</h2>
    <p><strong>Report:</strong> {{ summary.name }}</p>
    <p><strong>Period:</strong> {{ summary.period }}</p>

    {% if summary.result %}
    <table>
        <tr>
        <th>Type</th>
        <th>Value</th>
        <th>Progress</th>
        <th>Current</th>
        <th>Goal</th>
        </tr>
        {% for goal in summary.result %}
        {% set label = (
            'VIEWED PAGE' if goal.type == 'url' else
            'TRIGGERED EVENT' if goal.type == 'event' else
            'COLLECTED DATA' if goal.type == 'event-data' else
            goal.type | upper
        ) %}
        {% set progress = 0 %}
        {% if goal.result > 0 and goal.goal > 0 %}
            {% set progress = (goal.result / goal.goal * 100) | round(1) %}
        {% endif %}
        <tr>
            <td>{{ label }}</td>
            <td>{{ goal.value }}</td>
            <td style="min-width: 150px; padding: 0; margin: 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border: none; padding: 0; margin: 0; width: 100%;">
                    <tr>
                    <td style="padding: 0; margin: 0; vertical-align: middle; width: 100%;">
                        <div style="background-color: #e5e7eb; border-radius: 4px; height: 12px; overflow: hidden;">
                        <div style="background-color: #2563eb; width: {{ progress }}%; height: 100%;"></div>
                        </div>
                    </td>
                    <td style="padding: 0 0 0 8px; margin: 0; white-space: nowrap; font-size: 12px; color: #374151;">
                        {{ progress }}%
                    </td>
                    </tr>
                </table>
            </td>
            <td>{{ goal.result }}</td>
            <td>{{ goal.goal }}</td>
        </tr>
        {% endfor %}
    </table>
    {% else %}
    <p style="color: #6b7280; font-style: italic;">No goals defined.</p>
    {% endif %}



  </div>

  <div class="footer">
    Sent with <a href="https://github.com/ceviixx/UmamiSender">UmamiSender</a>
  </div>

</body>
</html>"""

def seed():
    default()
    # custom()

def default():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first():
        print(f"🌱 Seede Standard-{SENDER_TYPE}-Template...")
        template = MailTemplate(
            type="default",
            sender_type=SENDER_TYPE,
            content=TEMPLATE_CONTENT.strip() or None
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
            content=TEMPLATE_CONTENT.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()
