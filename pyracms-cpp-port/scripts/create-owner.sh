#!/usr/bin/env bash
# Create the FIRST Platform Owner (SuperAdmin) of a fresh production stack.
# Refuses to run when any platform-level account already exists, so it can
# never be used to take over a live install.
#   OWNER_USERNAME=owner OWNER_EMAIL=me@example.com ./scripts/create-owner.sh
# The password is read from the terminal (or OWNER_PASSWORD / stdin).
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/_compose.sh"
U="${OWNER_USERNAME:-}"; E="${OWNER_EMAIL:-}"; P="${OWNER_PASSWORD:-}"
[ -n "$U" ] || read -r -p "Username: " U
[ -n "$E" ] || read -r -p "E-mail: " E
if [ -z "$P" ]; then
  if [ -t 0 ]; then read -r -s -p "Password (>=8 chars): " P; echo
  else read -r P; fi
fi
[ "${#P}" -ge 8 ] || { echo "password must be >= 8 chars" >&2; exit 1; }

n="$(dc exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -tAc "SELECT count(*) FROM users WHERE tenant_id IS NULL"' | tr -d '\r ')"
if [ "$n" != "0" ]; then
  echo "Refusing: $n platform account(s) already exist." >&2
  echo "Promote an existing user from the Super Admin UI instead." >&2
  exit 1
fi

esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
body="{\"username\":\"$(esc "$U")\",\"email\":\"$(esc "$E")\","
body+="\"password\":\"$(esc "$P")\"}"
res="$(printf '%s' "$body" | dc exec -T backend curl -sS -X POST \
  http://127.0.0.1:8080/api/auth/register \
  -H 'Content-Type: application/json' --data-binary @-)"
case "$res" in
  *'"firstUser":true'*) echo "Platform Owner '$U' created (/auth/login)." ;;
  *) echo "Failed: $res" >&2; exit 1 ;;
esac
