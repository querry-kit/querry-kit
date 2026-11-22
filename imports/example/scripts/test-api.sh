#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export WORKBOARD_DB_NAME=workboard_test
export WORKBOARD_DB_PORT=${WORKBOARD_TEST_DB_PORT:-55463}
export PORT=${WORKBOARD_TEST_API_PORT:-35463}
export HOST=127.0.0.1
export WORKBOARD_TEST_API_URL="http://127.0.0.1:$PORT"
export WORKBOARD_TEST_DATABASE_URL="postgresql://workboard:workboard@127.0.0.1:$WORKBOARD_DB_PORT/workboard_test"
export DATABASE_URL=$WORKBOARD_TEST_DATABASE_URL
export WORKBOARD_SEED_PROFILE=compact
export DEMO_ORIGIN=${WORKBOARD_TEST_APP_ORIGIN:-http://127.0.0.1:3201}
project="workboard-api-test-$$"
temp=$(mktemp -d)
log="$temp/api.log"
override="$temp/compose.override.yml"

# The test project and database name keep fixture resets away from the development data.
cleanup() {
  if [[ -n ${api_pid:-} ]]; then
    kill "$api_pid" 2>/dev/null || true
    wait "$api_pid" 2>/dev/null || true
  fi
  docker compose -p "$project" -f compose.dev.yml -f "$override" down -v
  rm -f "$log" "$override"
  rmdir "$temp"
}
trap cleanup EXIT

cat > "$override" <<'YAML'
services:
  db:
    volumes:
      - workboard-data:/var/lib/postgresql

volumes:
  workboard-data:
YAML

docker compose -p "$project" -f compose.dev.yml -f "$override" up -d --wait
pnpm --filter @workboard/api db:migrate
pnpm --filter @workboard/api test:database
node apps/api/dist/main.js > "$log" 2>&1 &
api_pid=$!
if ! curl --fail --retry 10 --retry-all-errors --retry-delay 1 --max-time 3 --silent "$WORKBOARD_TEST_API_URL/api/health/ready"; then
  cat "$log"
  exit 1
fi

for suite in session reads access grouping writes; do
  pnpm --filter @workboard/api "test:$suite" || { cat "$log"; exit 1; }
done
