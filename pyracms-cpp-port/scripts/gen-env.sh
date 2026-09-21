#!/usr/bin/env bash
# Prints a production .env with freshly generated secrets:
#   ./scripts/gen-env.sh > .env.prod && chmod 600 .env.prod
# Optional: SITE_URL=https://cms.example.com NGINX_PORT=3199 ./gen-env.sh
set -euo pipefail
rand() { openssl rand -hex "$1"; }
cat <<ENV
POSTGRES_USER=pyracms
POSTGRES_DB=pyracms
POSTGRES_PASSWORD=$(rand 24)
JWT_SECRET=$(rand 48)
NGINX_BIND=${NGINX_BIND:-127.0.0.1}
NGINX_PORT=${NGINX_PORT:-3199}
# Public origin (no trailing slash): e-mail links, CORS, sitemap, OG tags.
SITE_URL=${SITE_URL:-http://localhost:${NGINX_PORT:-3199}}
# Uploaded-file storage (docs/STORAGE.md): production is S3-only, served by
# the bundled object store. Keys are generated here, never the
# object store's built-in minioadmin seed key (removed by OBJECTSTORE_REMOVE_SEED).
STORAGE_BACKEND=s3
S3_BUCKET=pyracms
S3_ACCESS_KEY=$(rand 10)
S3_SECRET_KEY=$(rand 24)
OBJECTSTORE_REMOVE_SEED=1
ENV
