from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_SUMMARY"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMAIL_SUMMARY</title>
  <style>{{ inline_css | safe }}</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="{{ summary.embedded_logo }}" alt="Logo" />
  </div>
  <h2>We’ve crunched the numbers – here’s your summary.</h2>
  <p><strong>Report:</strong> {{ summary.name }}</p>
  <p><strong>Period:</strong> {{ summary.period }}</p>

  {% if 'stats' in summary %}
    <h2>Key Metrics</h2>
    <table>
      <tr>
        <th>Views</th>
        <th>Visits</th>
        <th>Visitors</th>
        <th>Bounce rate</th>
        <th>Visit duration</th>
      </tr>
      {% if summary.stats %}
        <tr>
          <td>{{ summary.stats.pageviews }}</td>
          <td>{{ summary.stats.visits }}</td>
          <td>{{ summary.stats.visitors }}</td>
          <td>{{ summary.stats.bounces }}</td>
          <td>{{ summary.stats.totaltime }}</td>
        </tr>
      {% endif %}
    </table>
  {% endif %}

  {% if 'url' in summary.metrics %}
    <h2>Top Pages</h2>
    <table>
      <tr>
        <th>Pages</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.url %}
        {% for entry in summary.metrics.url %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'referrer' in summary.metrics %}
    <h2>Top Refferers</h2>
    <table>
      <tr>
        <th>Refferers</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.referrer %}
        {% for entry in summary.metrics.referrer %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'channel' in summary.metrics %}
    <h2>Top Channels</h2>
    <table>
      <tr>
        <th>Channels</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.channel %}
        {% for entry in summary.metrics.channel %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'browser' in summary.metrics %}
    <h2>Top Browsers</h2>
    <table>
      <tr>
        <th>Browsers</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.browser %}
        {% for entry in summary.metrics.browser %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'os' in summary.metrics %}
    <h2>Top Operating systems</h2>
    <table>
      <tr>
        <th>Operating systems</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.os %}
        {% for entry in summary.metrics.os %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'device' in summary.metrics %}
    <h2>Top Devices</h2>
    <table>
      <tr>
        <th>Devices</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.device %}
        {% for entry in summary.metrics.device %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'country' in summary.metrics %}
    <h2>Top Countries</h2>
    <table>
      <tr>
        <th>Countries</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.country %}
        {% for entry in summary.metrics.country %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'region' in summary.metrics %}
    <h2>Top Regions</h2>
    <table>
      <tr>
        <th>Regions</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.region %}
        {% for entry in summary.metrics.region %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'city' in summary.metrics %}
    <h2>Top Cities</h2>
    <table>
      <tr>
        <th>Cities</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.city %}
        {% for entry in summary.metrics.city %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'language' in summary.metrics %}
    <h2>Top Languages</h2>
    <table>
      <tr>
        <th>Languages</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.language %}
        {% for entry in summary.metrics.language %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'screen' in summary.metrics %}
    <h2>Top Screens</h2>
    <table>
      <tr>
        <th>Screens</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.screen %}
        {% for entry in summary.metrics.screen %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'event' in summary.metrics %}
    <h2>Top Events</h2>
    <table>
      <tr>
        <th>Events</th>
        <th style="width: 100px;">Actions</th>
      </tr>
      {% if summary.metrics.event %}
        {% for entry in summary.metrics.event %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'query' in summary.metrics %}
    <h2>Top Query parameters</h2>
    <table>
      <tr>
        <th>Query</th>
        <th style="width: 100px;">Views</th>
      </tr>
      {% if summary.metrics.query %}
        {% for entry in summary.metrics.query %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'host' in summary.metrics %}
    <h2>Top Hosts</h2>
    <table>
      <tr>
        <th>Hosts</th>
        <th style="width: 100px;">Visitors</th>
      </tr>
      {% if summary.metrics.host %}
        {% for entry in summary.metrics.host %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}

  {% if 'tag' in summary.metrics %}
    <h2>Top Tags</h2>
    <table>
      <tr>
        <th>Tags</th>
        <th style="width: 100px;">Views</th>
      </tr>
      {% if summary.metrics.tag %}
        {% for entry in summary.metrics.tag %}
          <tr>
            <td>{{ entry.x }}</td>
            <td>{{ entry.y }}</td>
          </tr>
        {% endfor %}
      {% endif %}
    </table>
  {% endif %}
</div>

<div class="footer">
  Sent with <a href="https://github.com/ceviixx/umami-sender">UmamiSender</a>
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

