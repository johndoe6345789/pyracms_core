#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
until pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-pyracms}" -q; do
    sleep 1
done
echo "PostgreSQL is ready."

echo "Running database migrations..."
# Re-run on every start: hide "already exists" notices, fail on real errors.
export PGOPTIONS='-c client_min_messages=warning'
for migration in /app/sql/*.sql; do
    echo "  Applying $(basename "$migration")..."
    PGPASSWORD="${DB_PASSWORD:-pyracms}" psql \
        -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "${DB_USER:-pyracms}" \
        -d "${DB_NAME:-pyracms}" \
        -f "$migration" \
        --no-password \
        -v ON_ERROR_STOP=1 \
        -q
done
echo "Migrations complete."

echo "Starting PyraCMS server..."
/app/pyracms_server &
SERVER_PID=$!

# Wait for the server to be ready, then run seed data
echo "Waiting for server to be ready..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:8080/api/tenants > /dev/null 2>&1; then
        echo "Server is ready."
        # Dev-only demo data with well-known credentials (admin/password123):
        # only when SEED_DEV=1 and never in production.
        if [ "${SEED_DEV:-0}" = "1" ] && [ "${PYRACMS_ENV:-}" != "production" ] \
            && [ -f /app/seed.sh ]; then
            bash /app/seed.sh || echo "Seed script failed (non-fatal)"
        else
            echo "SEED_DEV!=1 (or production): skipping demo seed data."
        fi
        # First-run bootstrap: create the Platform Owner from ADMIN_* env,
        # only while NO platform-level account exists (never a takeover).
        if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
            esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
            n=$(PGPASSWORD="${DB_PASSWORD:-pyracms}" psql \
                -h "${DB_HOST:-localhost}" -U "${DB_USER:-pyracms}" \
                -d "${DB_NAME:-pyracms}" -tAc \
                "SELECT count(*) FROM users WHERE tenant_id IS NULL")
            if [ "$n" = "0" ]; then
                body="{\"username\":\"$(esc "${ADMIN_USERNAME:-owner}")\","
                body="$body\"email\":\"$(esc "$ADMIN_EMAIL")\","
                body="$body\"password\":\"$(esc "$ADMIN_PASSWORD")\"}"
                printf '%s' "$body" | curl -sS -X POST -o /dev/null \
                    -w 'Platform Owner bootstrap: HTTP %{http_code}\n' \
                    -H 'Content-Type: application/json' --data-binary @- \
                    http://localhost:8080/api/auth/register || true
            else
                echo "ADMIN_* set but platform accounts exist: skipping."
            fi
        fi
        break
    fi
    sleep 1
done

wait $SERVER_PID
