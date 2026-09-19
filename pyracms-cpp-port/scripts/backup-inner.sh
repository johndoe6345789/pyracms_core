#!/bin/sh
# Runs INSIDE the `backup` compose service (postgres:15-alpine).
#   backup-inner.sh once   one backup + rotation, then exit
#   backup-inner.sh loop   repeat every BACKUP_INTERVAL_H hours
# Writes /backups/db-<ts>.dump (pg_dump -Fc) and uploads-<ts>.tar.gz and
# keeps the newest BACKUP_KEEP of each.
set -eu
KEEP="${BACKUP_KEEP:-14}"
H="${BACKUP_INTERVAL_H:-24}"

backup() {
  ts="$(date -u +%Y%m%dT%H%M%SZ)"
  pg_dump -Fc -f "/backups/db-$ts.dump.tmp"
  mv "/backups/db-$ts.dump.tmp" "/backups/db-$ts.dump"
  tar -C /uploads -czf "/backups/uploads-$ts.tar.gz.tmp" .
  mv "/backups/uploads-$ts.tar.gz.tmp" "/backups/uploads-$ts.tar.gz"
  for kind in db uploads; do
    ls -1t /backups/"$kind"-* 2>/dev/null | tail -n +"$((KEEP + 1))" |
      while read -r f; do rm -f -- "$f"; done
  done
  echo "backup $ts done ($(du -sh /backups | cut -f1) total)"
}

case "${1:-once}" in
  once) backup ;;
  loop) while :; do backup || echo "backup FAILED" >&2
        sleep "$((H * 3600))"; done ;;
  *) echo "usage: $0 once|loop" >&2; exit 2 ;;
esac
