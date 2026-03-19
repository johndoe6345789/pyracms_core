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
exec /app/pyracms_server
