import requests
from datetime import datetime, timedelta
from app.models.umami import UmamiType, Umami
from app.models.jobs import Job, Frequency

def fetch_website_summary(instance: Umami, job: Job):
    end = datetime.utcnow()
    if job.frequency == Frequency.daily:
        start = end - timedelta(hours=24)
    elif job.frequency == Frequency.weekly:
        start = end - timedelta(days=7)
    elif job.frequency == Frequency.monthly:
        start = end - timedelta(days=30)
        
    startAt = int(start.timestamp() * 1000)
    endAt = int(end.timestamp() * 1000)

    if "stats" in job.summary_items:
        stats = fetch_website_stats(instance, job.website_id, startAt=startAt, endAt=endAt)
        pageviews = stats.get("pageviews", {}).get("value", "-")
        visitors = stats.get("visitors", {}).get("value", "-")
        visits = stats.get("visits", {}).get("value", "-")
        bounces = stats.get("bounces", {}).get("value", "-")
        bounces = calculateBounceRate(visits, bounces)
        totaltime = stats.get("totaltime", {}).get("value", "-")
        totaltime = calculateTotaltime(totaltime)
        stats = {
            "pageviews": pageviews,
            "visitors": visitors,
            "visits": visits,
            "bounces": bounces,
            "totaltime": totaltime
        }
    else:
        stats = {}

    metrics = collect_metrics(instance, job, startAt, endAt)

    returnObject = {
        "stats": stats,
        "metrics": metrics
    }

    formatted_start = start.strftime('%B %d, %Y')
    formatted_end = end.strftime('%B %d, %Y')
    returnObject['period'] = f'{formatted_start} – {formatted_end}'

    return returnObject

def fetch_website_stats(instance: Umami, website_id: str, startAt, endAt):
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

def fetch_website_metrics(instance: Umami, website_id: str, startAt, endAt, metric_type="pageviews"):
    headers = {}

    if instance.type == UmamiType.cloud:
        hostname = "https://api.umami.is/v1"
        headers['x-umami-api-key'] = instance.api_key
    else:
        hostname = instance.hostname + "/api"
        headers['Authorization'] = f"Bearer {instance.bearer_token}"

    url = f"{hostname}/websites/{website_id}/metrics?startAt={startAt}&endAt={endAt}&type={metric_type}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        filtered = [item for item in data if item.get("y", 0) > 0]
        return filtered[:5]
    else:
        return []

def collect_metrics(instance, job, startAt, endAt):
    return {
        key: fetch_website_metrics(instance, job.website_id, startAt=startAt, endAt=endAt, metric_type=key)
        if key in job.summary_items else []
        for key in job.summary_items
        if key != "stats"
    }


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




def fetch_report_summary(instance: Umami, job: Job):
    info = fetchReportInfo(instance, job.report_id)
    type = info.get("type")
    parameters = info.get("parameters")
    parameters["timezone"] = job.timezone
    content = runReport(instance, type, parameters)
    returnObject = {
        "type": type,
        "result": content
    }
    return returnObject


def fetchReportInfo(instance: Umami, report_id: str):
    headers = {}


    if instance.type == UmamiType.cloud:
        hostname = "https://api.umami.is/v1"
        headers['x-umami-api-key'] = instance.api_key
    else:
        hostname = instance.hostname + "/api"
        headers['Authorization'] = f"Bearer {instance.bearer_token}"

    url = f"{hostname}/reports/{report_id}"
    response = requests.get(url, headers=headers)
    return response.json()

def runReport(instance, type, parameters):
    headers = {}

    if instance.type == UmamiType.cloud:
        hostname = "https://api.umami.is/v1"
        headers['x-umami-api-key'] = instance.api_key
    else:
        hostname = instance.hostname + "/api"
        headers['Authorization'] = f"Bearer {instance.bearer_token}"

    url = f"{hostname}/reports/{type}"
    response = requests.post(url, headers=headers, json=parameters)
    return response.json()