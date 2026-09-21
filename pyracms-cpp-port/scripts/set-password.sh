#!/usr/bin/env bash
# Reset a lost password on the production stack without the e-mail flow.
# The hash is made on the host (cli.py), then applied inside the Postgres
# container, which is not published to the host. The password is asked for
# on the terminal (or PYRACMS_NEW_PASSWORD) and never appears in argv.
#   ./scripts/set-password.sh USERNAME [SITE_SLUG]
# No SITE_SLUG means a platform account (portal sign-in, site owners).
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/_compose.sh"
[ $# -ge 1 ] || { echo "usage: $0 USERNAME [SITE_SLUG]" >&2; exit 1; }
site=(); [ -z "${2:-}" ] || site=(--tenant "$2")

sql="$("${PYTHON:-python3}" cli.py user set-password "$1" "${site[@]}" \
  --yes --print-sql)"
n="$(printf '%s' "$sql" | dc exec -T postgres sh -c \
  'psql -X -q -tA -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | tr -d '\r ')"
[ "$n" = "1" ] || { echo "No account named '$1'${2:+ on '$2'}." >&2; exit 1; }
echo "Password updated for '$1'; older sessions are signed out."
