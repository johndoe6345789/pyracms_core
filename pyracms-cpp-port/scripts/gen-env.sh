#!/usr/bin/env bash
# Prints a production .env with freshly generated secrets:
#   ./scripts/gen-env.sh > .env.prod && chmod 600 .env.prod
set -euo pipefail
rand() { openssl rand -hex "$1"; }
cat <<ENV
POSTGRES_USER=pyracms
POSTGRES_DB=pyracms
POSTGRES_PASSWORD=$(rand 24)
JWT_SECRET=$(rand 48)
NGINX_BIND=127.0.0.1
NGINX_PORT=3199
ENV
