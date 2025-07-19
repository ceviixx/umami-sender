#!/bin/bash
set -e

echo "⏳ Waiting for database..."
until pg_isready -h db -p 5432 -U "user" > /dev/null 2>&1; do
  sleep 1
done

echo "📁 Ensuring Alembic versions folder exists..."
mkdir -p alembic/versions/

echo "🔎 Checking for invalid alembic revision..."
if ! alembic current 2>&1 | grep -q "Current revision"; then
  echo "⚠️ Ungültige Revision oder keine Revision in DB gefunden – Setze zurück."
  export PGPASSWORD="pass"
  psql -h db -U "user" -d "umamisender" -c "DROP TABLE IF EXISTS alembic_version;"
fi

if [ -z "$(ls -A alembic/versions/)" ]; then
  echo "🛠️ Generating fresh migration from existing DB state..."
  alembic revision --autogenerate -m "initial from existing DB"
else
  echo "✅ Alembic versions already exist, skipping revision generation."
fi

echo "🚀 Applying migrations..."
alembic upgrade head

echo "🌱 Seeding default template (if not exists)..."
python3 -m app.seeds.templates

echo "✅ Starting backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000