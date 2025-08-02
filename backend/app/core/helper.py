import urllib.parse
from collections import defaultdict

def convertUTM(data):
    utm_keys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "utm_agid",
        "utm_banner"
    ]

    result = defaultdict(lambda: defaultdict(int))

    for item in data:
        query = item["url_query"]
        count = item["num"]

        parsed = urllib.parse.parse_qs(query)

        for key, values in parsed.items():
            for value in values:
                result[key][value] += count

    # Erstelle das finale dict mit allen utm_keys
    final = {}
    for key in utm_keys:
        if key in result:
            final[key] = dict(result[key])
        else:
            final[key] = {}
    return final
