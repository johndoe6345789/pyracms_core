#!/bin/sh
# Runs INSIDE the one-shot `objectstore-db` / `objectstore-init` compose
# services (postgres:15-alpine). Sets up the optional S3-compatible object
# store (profile "storage"; docs/STORAGE.md).
#   objectstore-init.sh db    create the `objectstore` database (idempotent)
#   objectstore-init.sh key   create/refresh PyraCMS's API key row
# Env: PGHOST PGUSER PGPASSWORD, OBJECTSTORE_DB (default objectstore),
#      S3_ACCESS_KEY S3_SECRET_KEY (generate with scripts/gen-env.sh),
#      OBJECTSTORE_REMOVE_SEED=1 to delete the store's built-in
#      minioadmin/minioadmin key (always do this in production).
set -eu
DB="${OBJECTSTORE_DB:-objectstore}"
export PGOPTIONS='-c client_min_messages=warning'

case "${1:-}" in
  db)
    until pg_isready -q; do sleep 1; done
    if [ "$(psql -d postgres -tAc \
        "SELECT 1 FROM pg_database WHERE datname = '$DB'")" != "1" ]; then
      psql -d postgres -v ON_ERROR_STOP=1 -q -c "CREATE DATABASE \"$DB\""
    fi
    echo "objectstore-init: database $DB ready"
    ;;
  key)
    : "${S3_ACCESS_KEY:?set S3_ACCESS_KEY}"
    : "${S3_SECRET_KEY:?set S3_SECRET_KEY}"
    # The store applies its migrations (api_keys table) on start.
    until [ "$(psql -d "$DB" -tAc \
        "SELECT to_regclass('api_keys') IS NOT NULL" 2>/dev/null)" = "t" ]
    do sleep 1; done
    psql -d "$DB" -v ON_ERROR_STOP=1 -q \
      -v ak="$S3_ACCESS_KEY" -v sk="$S3_SECRET_KEY" <<'SQL'
INSERT INTO api_keys (access_key, secret_key, owner, permissions)
VALUES (:'ak', :'sk', 'pyracms', 'read,write')
ON CONFLICT (access_key) DO UPDATE SET secret_key = EXCLUDED.secret_key;
SQL
    if [ "${OBJECTSTORE_REMOVE_SEED:-0}" = "1" ]; then
      psql -d "$DB" -v ON_ERROR_STOP=1 -q -c \
        "DELETE FROM api_keys WHERE access_key = 'minioadmin'"
      echo "objectstore-init: removed the seed minioadmin key"
    fi
    echo "objectstore-init: API key for PyraCMS ready"
    ;;
  *) echo "usage: $0 db|key" >&2; exit 2 ;;
esac
