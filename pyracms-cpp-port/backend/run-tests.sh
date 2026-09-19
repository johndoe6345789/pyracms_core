#!/bin/bash
# Runs the C++ tests against a scratch PostgreSQL database and prints
# gcov line coverage. Used by the Dockerfile "tests" stage.
# Fails when a test fails or whole-backend line coverage is below 80%.
set -e
export PGOPTIONS='-c client_min_messages=warning'
export PGPASSWORD="${DB_PASSWORD:-pyracms}"
H="${DB_HOST:-postgres}"; U="${DB_USER:-pyracms}"; DB="${TEST_DB_NAME:-pyracms_test}"
until pg_isready -h "$H" -U "$U" -q; do sleep 1; done

psql -h "$H" -U "$U" -d postgres -q \
  -c "DROP DATABASE IF EXISTS $DB WITH (FORCE)" -c "CREATE DATABASE $DB"
# Migrations run twice on purpose: they must be idempotent.
for pass in 1 2; do
  for f in /app/sql/*.sql; do
    psql -h "$H" -U "$U" -d $DB -q -v ON_ERROR_STOP=1 -f "$f" >/dev/null
  done
done

export TEST_DB_HOST="$H" TEST_DB_USER="$U" TEST_DB_NAME=$DB
export TEST_DB_PASSWORD="$PGPASSWORD"
STATUS=0
/app/build/tests/pyracms_tests || STATUS=$?

# Excluded from coverage (each needs a live third-party service that
# cannot exist in the scratch database; only glue around it lives there):
#  - main.cpp and startup/: process bootstrap (env config, timers).
#  - services/elasticsearch/: HTTP client for an Elasticsearch cluster.
#    Also the ES branches of SearchService (GCOVR_EXCL_START markers).
#  - services/oauth/: HTTP token/profile exchange with GitHub/Google/Discord.
#  - services/email/: SMTP delivery.
#  - services/cache/: Redis client.
#  - DockerExecutionService: runs snippets via the host docker daemon.
EXCLUDES=(--exclude '/app/src/main.cpp'
  --exclude '/app/src/services/elasticsearch/'
  --exclude '/app/src/services/oauth/'
  --exclude '/app/src/services/email/'
  --exclude '/app/src/services/cache/'
  --exclude '/app/src/services/DockerExecutionService.cpp'
  --exclude '/app/src/startup/')

gcovr -r /app --object-directory /app/build --filter '/app/src/' \
  "${EXCLUDES[@]}" --json-summary /cov.json --txt /coverage.txt \
  >/dev/null 2>&1 || true
echo "=== coverage: files under 80% ==="
python3 - <<'PY'
import json
d = json.load(open("/cov.json"))["files"]
rows = [(f["line_total"] - f["line_covered"], f["line_total"],
         (f["line_percent"] if f["line_percent"] is not None else 100), f["filename"]) for f in d
        if (f["line_percent"] if f["line_percent"] is not None else 100) < 80]
for miss, tot, pct, n in sorted(rows, reverse=True):
    print(f"{n} {tot} {pct:.0f}% (missing {miss})")
PY
echo "=== coverage: whole backend ==="
gcovr -r /app --object-directory /app/build --filter '/app/src/' \
  "${EXCLUDES[@]}" --print-summary --fail-under-line 80 \
  2>&1 | tail -n 4 || STATUS=$?
echo "=== coverage: filters, auth, user, tenant, forum, menu, snippet ==="
gcovr -r /app --object-directory /app/build \
  --filter '/app/src/filters/' --filter '/app/src/services/AuthService' \
  --filter '/app/src/services/UserService' \
  --filter '/app/src/services/TenantService' \
  --filter '/app/src/services/ForumService' \
  --filter '/app/src/services/MenuService' \
  --filter '/app/src/services/CodeSnippetService' \
  --filter '/app/src/services/forum/' --filter '/app/src/services/user/' \
  --filter '/app/src/services/snippet/' --filter '/app/src/services/menu/' \
  --print-summary | tail -n 4
exit $STATUS
