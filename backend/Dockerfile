FROM python:3.11-slim

# Systempakete installieren, u. a. für pg_isready
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
 && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis
WORKDIR /app

# Anforderungen installieren
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code kopieren
COPY . .

# Entrypoint-Skript ausführbar machen
RUN chmod +x /app/entrypoint.sh

# Port freigeben
EXPOSE 8000

# Einstiegspunkt setzen
ENTRYPOINT ["/app/entrypoint.sh"]
