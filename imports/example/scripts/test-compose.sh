#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export WORKBOARD_APP_PORT=${WORKBOARD_TEST_COMPOSE_PORT:-35465}
export WORKBOARD_TEST_APP_URL="http://127.0.0.1:$WORKBOARD_APP_PORT"
project="workboard-compose-test-$$"
temp=$(mktemp -d)

# Use an isolated Compose project and delete only its temporary containers and volume.
cleanup() {
  docker compose -p "$project" down -v
  rm -f "$temp/session.cookies" "$temp/before.json" "$temp/after.json" "$temp/compose.override.yml"
  rmdir "$temp"
}
trap cleanup EXIT

cat > "$temp/compose.override.yml" <<'YAML'
services:
  api:
    environment:
      WORKBOARD_SEED_PROFILE: compact
  db:
    volumes:
      - workboard-data:/var/lib/postgresql

volumes:
  workboard-data:
YAML
export COMPOSE_FILE="compose.yml:$temp/compose.override.yml"

# Captures all fixture IDs through the app origin so a restart cannot hide duplicated data.
read_ids() {
  curl -fsS --cookie-jar "$temp/session.cookies" \
    -H "Origin: $WORKBOARD_TEST_APP_URL" -H 'Content-Type: application/json' \
    --data '{"login":"admin"}' "$WORKBOARD_TEST_APP_URL/api/demo/session" > /dev/null
  curl -fsS --cookie "$temp/session.cookies" \
    "$WORKBOARD_TEST_APP_URL/api/tasks?fields=id&perPage=100" |
    jq -e 'if .meta.itemCount == 18 then [.items[].id] else error("Expected 18 seeded items") end' > "$1"
}

docker compose -p "$project" build --no-cache
docker compose -p "$project" up -d --no-build --wait
test "$(docker compose -p "$project" port app 3201)" = "127.0.0.1:$WORKBOARD_APP_PORT"
test "$(docker inspect -f '{{len .HostConfig.PortBindings}}' "$(docker compose -p "$project" ps -q api)")" = 0
test "$(docker inspect -f '{{len .HostConfig.PortBindings}}' "$(docker compose -p "$project" ps -q db)")" = 0
curl -fsS "$WORKBOARD_TEST_APP_URL/docs/openapi.json" | jq -e '.paths["/api/tasks/group-by"].get != null'
curl -fsS --ipv4 \
  -H "Origin: http://localhost:$WORKBOARD_APP_PORT" -H 'Content-Type: application/json' \
  --data '{"login":"admin"}' "http://localhost:$WORKBOARD_APP_PORT/api/demo/session" > /dev/null
read_ids "$temp/before.json"
pnpm test:web
docker compose -p "$project" restart api app
docker compose -p "$project" up -d --no-build --wait
read_ids "$temp/after.json"
diff -u "$temp/before.json" "$temp/after.json"
