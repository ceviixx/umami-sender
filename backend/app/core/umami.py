import requests
from datetime import datetime, timedelta
from app.models.umami import UmamiType
from app.models.mailer import MailerJob, Frequency

def fetch_website_summary(instance, job: MailerJob):

    end = datetime.utcnow()
    if job.frequency == Frequency.daily:
        start = end - timedelta(hours=24)
    elif job.frequency == Frequency.weekly:
        start = end - timedelta(days=7)
    elif job.frequency == Frequency.monthly:
        start = end - timedelta(days=30)
        
    startAt = int(start.timestamp() * 1000)
    endAt = int(end.timestamp() * 1000)

    stats = fetch_website_stats(instance, job.website_id, startAt=startAt, endAt=endAt)
    metrics_url = fetch_website_metrics(instance, job.website_id, startAt=startAt, endAt=endAt, metric_type='url')
    metrics_referrer = fetch_website_metrics(instance, job.website_id, startAt=startAt, endAt=endAt, metric_type='referrer')

    pageviews = stats.get("pageviews", {}).get("value", "-")
    visitors = stats.get("visitors", {}).get("value", "-")
    visits = stats.get("visits", {}).get("value", "-")
    bounces = stats.get("bounces", {}).get("value", "-")
    bounces = calculateBounceRate(visits, bounces)
    totaltime = stats.get("totaltime", {}).get("value", "-")
    totaltime = calculateTotaltime(totaltime)

    returnObject = {
        "stats": {
            "pageviews": pageviews,
            "visitors": visitors,
            "visits": visits,
            "bounces": bounces,
            "totaltime": totaltime
        },
        "pageviews": metrics_url,
        "referrers": metrics_referrer,
    }
    return returnObject

def fetch_website_stats(instance, website_id, startAt, endAt):
    headers = {}

    if instance.type == UmamiType.cloud:
        hostname = "https://api.umami.is/v1"
        headers['x-umami-api-key'] = instance.api_key
    else:
        hostname = instance.hostname + "/api"
        headers['Authorization'] = f"Bearer {instance.bearer_token}"

    url = f"{hostname}/websites/{website_id}/stats?startAt={startAt}&endAt={endAt}"
    response = requests.get(url, headers=headers)
    return response.json()

def fetch_website_metrics(instance, website_id, startAt, endAt, metric_type="pageviews"):
    headers = {}

    if instance.type == UmamiType.cloud:
        hostname = "https://api.umami.is/v1"
        headers['x-umami-api-key'] = instance.api_key
    else:
        hostname = instance.hostname + "/api"
        headers['Authorization'] = f"Bearer {instance.bearer_token}"

    url = f"{hostname}/websites/{website_id}/metrics?startAt={startAt}&endAt={endAt}&type={metric_type}"
    response = requests.get(url, headers=headers)
    return response.json()




def parseTime(totaltime):
    days = int(totaltime // 86400)
    totaltime %= 86400

    hours = int(totaltime // 3600)
    totaltime %= 3600

    minutes = int(totaltime // 60)
    totaltime %= 60

    seconds = int(totaltime)
    ms = int((totaltime - seconds) * 1000)

    return days, hours, minutes, seconds, ms

def calculateTotaltime(totaltime):
    days, hours, minutes, seconds, ms = parseTime(totaltime)
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if seconds > 0:
        parts.append(f"{seconds}s")
    if ms > 0:
        parts.append(f"{ms}ms")

    return " ".join(parts) if parts else "0s"


def calculateBounceRate(visits, bounces):
    if visits == 0:
        return "0%"
    bounce_rate = (bounces / visits) * 100
    return f"{round(bounce_rate)}%"