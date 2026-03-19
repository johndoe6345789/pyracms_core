#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
until pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-pyracms}" -q; do
    sleep 1
done
echo "PostgreSQL is ready."

echo "Running database migrations..."
for migration in /app/sql/*.sql; do
    echo "  Applying $(basename "$migration")..."
    PGPASSWORD="${DB_PASSWORD:-pyracms}" psql \
        -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "${DB_USER:-pyracms}" \
        -d "${DB_NAME:-pyracms}" \
        -f "$migration" \
        --no-password \
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
        if [ -f /app/seed.sh ]; then
            bash /app/seed.sh || echo "Seed script failed (non-fatal)"
        fi
        break
    fi
    sleep 1
done

wait $SERVER_PID
