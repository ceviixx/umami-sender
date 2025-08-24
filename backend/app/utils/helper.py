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

    # Finales dict mit Sortierung nach Anzahl (absteigend)
    final = {}
    for key in utm_keys:
        if key in result:
            sorted_items = sorted(result[key].items(), key=lambda x: x[1], reverse=True)
            final[key] = dict(sorted_items)
        else:
            final[key] = {}

    return final
