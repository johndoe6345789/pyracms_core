#!/usr/bin/env bash
# One-off backup of the running prod stack: database (pg_dump -Fc) and the
# uploads volume, into ${BACKUP_DIR:-./backups}, keeping BACKUP_KEEP (14).
#   ./scripts/backup.sh
# Run it from cron for scheduled backups, or use the compose `backup`
# profile (docs/OPERATIONS.md). Copy the files OFF the host as well.
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/_compose.sh"
export BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
mkdir -p "$BACKUP_DIR"
dc --profile backup run --rm --no-deps -T backup once
echo "Backups in $BACKUP_DIR:"
ls -1t "$BACKUP_DIR" | head -n 6
