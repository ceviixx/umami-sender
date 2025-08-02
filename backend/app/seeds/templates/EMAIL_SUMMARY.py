from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_SUMMARY"

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

    {% if 'stats' in summary %}
        <h2>Key Metrics</h2>
        {% if summary.stats %}
            <table>
            <tr>
                <th>Views</th>
                <th>Visits</th>
                <th>Visitors</th>
                <th>Bounce rate</th>
                <th>Visit duration</th>
            </tr>
            <tr>
                <td>{{ summary.stats.pageviews }}</td>
                <td>{{ summary.stats.visits }}</td>
                <td>{{ summary.stats.visitors }}</td>
                <td>{{ summary.stats.bounces }}</td>
                <td>{{ summary.stats.totaltime }}</td>
            </tr>
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    {% if 'url' in summary.metrics %}
        <h2>Top Pages</h2>
        {% if summary.metrics.url %}
            <table>
            <tr>
                <th>Pages</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.url %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'referrer' in summary.metrics %}
        <h2>Top Refferers</h2>
        {% if summary.metrics.referrer %}
            <table>
            <tr>
                <th>Refferers</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.referrer %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'channel' in summary.metrics %}
        <h2>Top Channels</h2>
        {% if summary.metrics.channel %}
            <table>
            <tr>
                <th>Channels</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.channel %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'browser' in summary.metrics %}
        <h2>Top Browsers</h2>
        {% if summary.metrics.browser %}
            <table>
            <tr>
                <th>Browsers</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.browser %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'os' in summary.metrics %}
        <h2>Top Operating systems</h2>
        {% if summary.metrics.os %}
            <table>
            <tr>
                <th>Operating systems</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.os %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'device' in summary.metrics %}
        <h2>Top Devices</h2>
        {% if summary.metrics.device %}
            <table>
            <tr>
                <th>Devices</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.device %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'country' in summary.metrics %}
        <h2>Top Countries</h2>
        {% if summary.metrics.country %}
            <table>
            <tr>
                <th>Countries</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.country %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'region' in summary.metrics %}
        <h2>Top Regions</h2>
        {% if summary.metrics.region %}
            <table>
            <tr>
                <th>Regions</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.region %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'city' in summary.metrics %}
        <h2>Top Cities</h2>
        {% if summary.metrics.city %}
            <table>
            <tr>
                <th>Cities</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.city %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'language' in summary.metrics %}
        <h2>Top Languages</h2>
        {% if summary.metrics.language %}
            <table>
            <tr>
                <th>Languages</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.language %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'screen' in summary.metrics %}
        <h2>Top Screens</h2>
        {% if summary.metrics.screen %}
            <table>
            <tr>
                <th>Screens</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.screen %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'event' in summary.metrics %}
        <h2>Top Events</h2>
        {% if summary.metrics.event %}
            <table>
            <tr>
                <th>Events</th>
                <th style="width: 100px;">Actions</th>
            </tr>
            {% for entry in summary.metrics.event %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'query' in summary.metrics %}
        <h2>Top Query parameters</h2>
        {% if summary.metrics.query %}
            <table>
            <tr>
                <th>Query</th>
                <th style="width: 100px;">Views</th>
            </tr>
            {% for entry in summary.metrics.query %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'host' in summary.metrics %}
        <h2>Top Hosts</h2>
        {% if summary.metrics.host %}
            <table>
            <tr>
                <th>Hosts</th>
                <th style="width: 100px;">Visitors</th>
            </tr>
            {% for entry in summary.metrics.host %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

    
    {% if 'tag' in summary.metrics %}
        <h2>Top Tags</h2>
        {% if summary.metrics.tag %}
            <table>
            <tr>
                <th>Tags</th>
                <th style="width: 100px;">Views</th>
            </tr>
            {% for entry in summary.metrics.tag %}
            <tr>
                <td>{{ entry.x }}</td>
                <td>{{ entry.y }}</td>
            </tr>
            {% endfor %}
            </table>
        {% else %}
            <p style="color: #6b7280; font-style: italic;">No data available.</p>
        {% endif %}
    {% endif %}

  </div>
  <div class="footer">
    Sent with <a href="https://github.com/ceviixx/UmamiSender">UmamiSender</a>
  </div>
</body>
</html>"""

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
                {"x": "/","y": 1156}, 
                {"x": "/pricing","y": 258}, 
                {"x": "/docs","y": 212}, 
                {"x": "/blog/what-is-coming-in-umami-v3","y": 159}, 
                {"x": "/docs/install","y": 120}
            ],
            "referrer": [
                {"x": "google.com","y": 350}, 
                {"x": "qiita.com","y": 45}, 
                {"x": "duckduckgo.com","y": 36}, 
                {"x": "chatgpt.com","y": 25}, 
                {"x": "t.co","y": 18}
            ],
            "channel": [
                {"x": "direct","y": 860}, 
                {"x": "organicSearch","y": 456}, 
                {"x": "organicSocial","y": 31}, 
                {"x": "referral","y": 1}, 
                {"x": "paidAds","y": 1},
            ],
            "browser": [
                {"x": "chrome","y": 961}, 
                {"x": "firefox","y": 213}, {"x": "safari","y": 93}, 
                {"x": "ios","y": 88}, 
                {"x": "edge-chromium","y": 73}, 
                {"x": "crios","y": 27}
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

