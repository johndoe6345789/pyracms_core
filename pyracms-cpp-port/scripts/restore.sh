#!/usr/bin/env bash
# Restore a backup made by backup.sh. DESTRUCTIVE: replaces the database
# (and the uploads volume when a tarball is given).
#   ./scripts/restore.sh --yes db-<ts>.dump [uploads-<ts>.tar.gz]
# The backend is stopped during the restore and started again afterwards.
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/_compose.sh"
[ "${1:-}" = "--yes" ] || {
  echo "usage: $0 --yes <db.dump> [uploads.tar.gz]  (destructive)" >&2
  exit 2; }
DUMP="$(realpath "$2")"; UPL="${3:+$(realpath "$3")}"
[ -f "$DUMP" ] || { echo "no such file: $DUMP" >&2; exit 1; }

dc stop backend frontend nginx
dc exec -T postgres sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists \
   --no-owner --single-transaction' < "$DUMP"
if [ -n "$UPL" ]; then
  docker run --rm -v "${PROJECT}_uploads_data:/data" \
    -v "$UPL:/in.tgz:ro" alpine:3.20 \
    sh -c 'rm -rf /data/* /data/.[!.]* 2>/dev/null; tar -xzf /in.tgz -C /data
           chown -R 10001:10001 /data'
fi
dc up -d
echo "Restore complete. Check: ./scripts/smoke.sh <url>"
