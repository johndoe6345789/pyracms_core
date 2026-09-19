#!/usr/bin/env bash
# Sourced by the ops scripts. Override with env vars:
#   PROJECT (pyracms-prod)  ENV_FILE (.env.prod)
#   BASE_COMPOSE (docker-compose.yml | docker-compose.ghcr.yml)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1
export MSYS_NO_PATHCONV=1      # git-bash on Windows: keep /paths intact
PROJECT="${PROJECT:-pyracms-prod}"
ENV_FILE="${ENV_FILE:-.env.prod}"
BASE_COMPOSE="${BASE_COMPOSE:-docker-compose.yml}"
[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE" >&2; exit 1; }

dc() {
  docker compose -p "$PROJECT" -f "$BASE_COMPOSE" \
    -f docker-compose.prod.yml --env-file "$ENV_FILE" "$@"
}
# Read one KEY from the env file (no export, no eval).
envval() { sed -n "s/^$1=//p" "$ENV_FILE" | tail -n1; }
