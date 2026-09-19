#!/usr/bin/env bash
# Smoke test for a running PyraCMS stack (any URL, no docker needed).
#   ./scripts/smoke.sh [base-url]        default http://localhost:3199
# Env: SMOKE_RATELIMIT=0  skip the login-spam (429) check
#      SMOKE_WRITE=0      skip the check that registers a throwaway
#                         platform account (tenant isolation)
# Exit status = number of failed checks.
BASE="${1:-http://localhost:3199}"; BASE="${BASE%/}"
export MSYS_NO_PATHCONV=1
FAIL=0
ok()   { echo "  ok    $1"; }
bad()  { echo "  FAIL  $1"; FAIL=$((FAIL + 1)); }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
want() { # want <desc> <expected-code> <curl args...>
  local d="$1" e="$2"; shift 2; local c; c="$(code "$@")"
  [ "$c" = "$e" ] && ok "$d ($c)" || bad "$d: expected $e got $c"
}
hdr() { # hdr <desc> <url> <header-regex>   (case-insensitive)
  curl -sI "$2" | tr -d '\r' | grep -qiE "^$3" && ok "$1" || bad "$1"
}
nohdr() {
  curl -sI "$2" | tr -d '\r' | grep -qiE "^$3" && bad "$1" || ok "$1"
}

echo "== $BASE"
echo "-- availability"
want "nginx liveness /healthz" 200 "$BASE/healthz"
want "readiness /readyz (backend+db)" 200 "$BASE/readyz"
want "home page" 200 "$BASE/"
want "robots.txt" 200 "$BASE/robots.txt"
want "sitemap.xml" 200 "$BASE/sitemap.xml"
want "manifest.json" 200 "$BASE/manifest.json"
want "favicon.ico" 200 "$BASE/favicon.ico"
want "unknown page is 404" 404 "$BASE/this-page-does-not-exist"
want "public API /api/tenants" 200 "$BASE/api/tenants"

echo "-- security headers"
for h in "Content-Security-Policy" "X-Content-Type-Options: nosniff" \
         "X-Frame-Options: DENY" "Referrer-Policy"; do
  hdr "page sends $h" "$BASE/" "$h"
done
hdr "API sends nosniff" "$BASE/api/tenants" "X-Content-Type-Options"
nohdr "no X-Powered-By" "$BASE/" "X-Powered-By"
nohdr "no nginx version" "$BASE/" "Server: nginx/"
case "$BASE" in https://*)
  hdr "HSTS on https" "$BASE/" "Strict-Transport-Security";; esac
want "dotfiles hidden (/.env)" 404 "$BASE/.env"
want "dotfiles hidden (/.git/config)" 404 "$BASE/.git/config"

echo "-- authorization"
want "anonymous /api/users is 401" 401 "$BASE/api/users"
want "bad login is 401" 401 -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"nobody","password":"wrong-password"}'

if [ "${SMOKE_WRITE:-1}" = 1 ]; then
  echo "-- tenant isolation (creates one throwaway platform account)"
  u="smoke$(date +%s)$RANDOM"
  reg="$(code -X POST "$BASE/api/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$u\",\"email\":\"$u@example.invalid\",\"password\":\"Sm0ke-test-pw\"}")"
  slug="$(curl -s "$BASE/api/tenants" | sed -n 's/.*"slug":"\([^"]*\)".*/\1/p' | head -n1)"
  if [ "$reg" != 201 ]; then ok "register skipped (HTTP $reg: rate limit or closed)"
  elif [ -z "$slug" ]; then ok "no tenant yet: isolation check skipped"
  else
    want "platform account cannot log in to tenant '$slug'" 401 \
      -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
      -d "{\"username\":\"$u\",\"password\":\"Sm0ke-test-pw\",\"tenant\":\"$slug\"}"
  fi
fi

if [ "${SMOKE_RATELIMIT:-1}" = 1 ]; then
  echo "-- rate limit (login spam must hit 429)"
  hit=0
  for _ in $(seq 1 45); do
    [ "$(code -X POST "$BASE/api/auth/login" \
      -H 'Content-Type: application/json' \
      -d '{"username":"x","password":"y"}')" = 429 ] && { hit=1; break; }
  done
  [ "$hit" = 1 ] && ok "429 after login spam" || bad "no 429 after 45 logins"
fi

echo; [ "$FAIL" = 0 ] && echo "SMOKE PASSED" || echo "SMOKE: $FAIL FAILED"
exit "$FAIL"
