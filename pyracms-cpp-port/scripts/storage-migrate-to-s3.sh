#!/bin/sh
# Copies files stored on local disk into the S3-compatible object store and
# flips their `storage` column, one file at a time (safe to re-run; local
# copies are kept until you delete them). Runs INSIDE the backend container,
# which already has DB_*, S3_* and curl/psql:
#   docker compose exec -T backend sh -s < scripts/storage-migrate-to-s3.sh
#   DRY_RUN=1 ... to only list what would move.  See docs/STORAGE.md.
set -eu
: "${S3_ENDPOINT:?S3_ENDPOINT not set}" "${S3_ACCESS_KEY:?}" "${S3_SECRET_KEY:?}"
B="${S3_BUCKET:-pyracms}"
DIR="${UPLOAD_DIR:-/app/uploads}"
# Every request is AWS Signature V4 signed by curl (>= 7.75); the payload
# hash is sent explicitly so the signature covers the real bytes.
SIG="aws:amz:${S3_REGION:-us-east-1}:s3"
EMPTY=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
export PGPASSWORD="${DB_PASSWORD:-pyracms}"
sql() { psql -h "${DB_HOST:-postgres}" -U "${DB_USER:-pyracms}" \
  -d "${DB_NAME:-pyracms}" -v ON_ERROR_STOP=1 -tA "$@"; }
s3curl() { curl -sS -o /dev/null --aws-sigv4 "$SIG" \
  -u "$S3_ACCESS_KEY:$S3_SECRET_KEY" "$@"; }
put() { s3curl -w '%{http_code}' -X PUT \
  -H "x-amz-content-sha256: $(sha256sum "$1" | cut -d' ' -f1)" \
  -H 'Content-Type: application/octet-stream' --data-binary @"$1" "$2"; }
[ -n "${DRY_RUN:-}" ] || s3curl -X PUT -H "x-amz-content-sha256: $EMPTY" \
  "$S3_ENDPOINT/$B" || true   # 409 = bucket exists
moved=0; failed=0
for row in $(sql -F, -c \
  "SELECT uuid, COALESCE(tenant_id,0) FROM files WHERE storage='local'"); do
  uuid="${row%,*}"; t="${row#*,}"
  case "$uuid" in *[!0-9a-fA-F-]*|"") continue ;; esac   # uuid shape only
  if [ ! -f "$DIR/$uuid" ]; then echo "skip $uuid (no local file)"; continue; fi
  if [ -n "${DRY_RUN:-}" ]; then echo "would move $uuid (tenant $t)"; continue; fi
  code="$(put "$DIR/$uuid" "$S3_ENDPOINT/$B/tenant-$t-$uuid")"
  if [ -f "$DIR/thumbnails/$uuid" ]; then
    put "$DIR/thumbnails/$uuid" \
      "$S3_ENDPOINT/$B/tenant-$t-thumb-$uuid" >/dev/null || true
  fi
  case "$code" in
    2??) sql -c "UPDATE files SET storage='s3' WHERE uuid='$uuid'" >/dev/null
         moved=$((moved + 1)) ;;
    *) echo "FAILED $uuid (HTTP $code)" >&2; failed=$((failed + 1)) ;;
  esac
done
echo "migrated $moved file(s), $failed failed"
[ "$failed" -eq 0 ]
