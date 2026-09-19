#!/usr/bin/env bash
# Send a test e-mail through the SMTP settings the backend container uses
# (SMTP_HOST/PORT/USER/PASS/FROM), so a bad password, port or TLS problem
# shows up now and not when the first user clicks "forgot password".
#   ./scripts/test-mail.sh you@example.com
# Port 465 = implicit TLS (smtps), anything else = STARTTLS.
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/_compose.sh"
TO="${1:?usage: $0 recipient@example.com}"
dc exec -T -e TO="$TO" backend sh -c '
  H="${SMTP_HOST:-smtp.gmail.com}"; PT="${SMTP_PORT:-587}"
  F="${SMTP_FROM:-noreply@pyracms.com}"
  if [ "$PT" = 465 ]; then URL="smtps://$H:$PT"; TLS=""
  else URL="smtp://$H:$PT"; TLS="--ssl-reqd"; fi
  [ -n "${SMTP_USER:-}" ] || echo "warning: SMTP_USER empty (no auth)" >&2
  printf "From: %s\r\nTo: %s\r\nSubject: PyraCMS test mail\r\n\r\nOK\r\n" \
    "$F" "$TO" | curl -sS --fail $TLS "$URL" --mail-from "$F" \
    --mail-rcpt "$TO" --user "${SMTP_USER:-}:${SMTP_PASS:-}" -T - \
  && echo "sent via $H:$PT as ${SMTP_USER:-<none>}"'
