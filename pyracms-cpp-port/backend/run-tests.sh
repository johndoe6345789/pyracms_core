#!/bin/bash
# Runs the C++ tests against a scratch PostgreSQL database and prints
# gcov line coverage. Used by the Dockerfile "tests" stage.
set -e
export PGOPTIONS='-c client_min_messages=warning'
export PGPASSWORD="${DB_PASSWORD:-pyracms}"
H="${DB_HOST:-postgres}"; U="${DB_USER:-pyracms}"; DB=pyracms_test
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

gcovr -r /app --object-directory /app/build \
  --filter '/app/src/' --exclude '/app/src/main.cpp' \
  --print-summary --txt /coverage.txt >/dev/null 2>&1 || true
echo "=== coverage: whole backend ==="; tail -n 4 /coverage.txt
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
