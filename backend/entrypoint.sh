#!/bin/bash
set -euo pipefail

: "${DB_HOST:=db}"
: "${DB_PORT:=5432}"
: "${DB_USER:=user}"
: "${DB_PASS:=pass}"
: "${DB_NAME:=umamisender}"

export PGPASSWORD="$DB_PASS"

if [ -z "${SECRET_KEY:-}" ]; then
  echo "❌ SECRET_KEY is not set."
  exit 1
fi

echo "⏳ Waiting for database ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; do
  sleep 1
done

echo "📁 Ensuring Alembic versions folder exists..."
mkdir -p alembic/versions/

db_has_known_tables() {
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema='public'
      AND table_name IN ('users','senders','jobs','job_logs','webhooks','mailer_jobs','templates')
  " | awk '{print int($1)}'
}

alembic_version_table_exists() {
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "
    SELECT to_regclass('public.alembic_version') IS NOT NULL
  " | grep -q t
}

get_db_revision() {
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT version_num FROM alembic_version LIMIT 1" 2>/dev/null | tr -d '[:space:]'
}

revision_file_exists() {
  local rev="$1"
  ls -1 alembic/versions/${rev}_*.py >/dev/null 2>&1
}

echo "🔒 Acquiring migration lock…"
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT pg_advisory_lock(424242);" >/dev/null

cleanup_lock() {
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT pg_advisory_unlock(424242);" >/dev/null || true
}
trap cleanup_lock EXIT

echo "🔎 Checking Alembic / DB state…"

if alembic_version_table_exists; then
  db_rev="$(get_db_revision || true)"
  if [ -n "${db_rev:-}" ]; then
    if ! revision_file_exists "$db_rev"; then
      echo "⚠️  DB points to unknown revision (${db_rev}) → deleting entry from alembic_version."
      psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "DELETE FROM alembic_version;" >/dev/null || true
    else
      echo "ℹ️  DB revision (${db_rev}) exists in container."
    fi
  else
    echo "ℹ️  alembic_version table exists but is empty."
  fi
else
  echo "ℹ️  No alembic_version table found in DB (will be created on demand)."
fi

echo "🛠️  Autogenerating migration (if needed)…"
before_latest="$(ls -1t alembic/versions/*.py 2>/dev/null | head -n1 || true)"
alembic revision --autogenerate -m "autogen $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
after_latest="$(ls -1t alembic/versions/*.py 2>/dev/null | head -n1 || true)"

if [ -n "$after_latest" ] && [ "$after_latest" != "$before_latest" ]; then
  if grep -qE "def upgrade\(\):\s+pass" "$after_latest" && grep -qE "def downgrade\(\):\s+pass" "$after_latest"; then
    echo "ℹ️  No schema changes detected → removing empty revision $(basename "$after_latest")"
    rm -f "$after_latest"
    after_latest="$before_latest"
  else
    echo "✅ New migration generated: $(basename "$after_latest")"
  fi
else
  echo "ℹ️  No new migration generated."
fi

echo "🚀 Applying migrations…"
alembic upgrade head

echo "🌱 Seeding default data…"
python3 -m app.seeds.initial_user || true
python3 -m app.services.import_templates || echo "⚠️ Template import failed (non-blocking)"


echo "✅ Starting backend…"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
