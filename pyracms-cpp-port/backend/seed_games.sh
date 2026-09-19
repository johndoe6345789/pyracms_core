#!/bin/bash
# Registers the ../games catalog for one tenant (mirrors
# scripts/seed_games.py). Sourced by seed.sh, which supplies API, AUTH and
# TENANT_ID. Idempotent: POSTs of existing rows answer 409 and are ignored.
# Binaries are attached later by CI (scripts/publish_manifest.py).

# name|display|description|version|tags|pip requirements
GAMES='asteroids|Asteroids|Vector-style space shooter: rotate, thrust, shoot rocks that split, survive waves.|1.0.0|arcade,shooter,pygame|pygame==2.6.1
breakout|Breakout|Bounce the ball off your paddle and clear every brick. Pure shapes, no assets.|1.0.0|arcade,classic,pygame|pygame==2.6.1
pong|Pong|Pong against a CPU paddle (or a friend with --two-player).|1.0.0|arcade,classic,pyglet|pyglet==2.1.16
snake|Snake|Classic Snake with speed ramp, pause and restart. Pure shapes, no assets.|1.0.0|arcade,classic,pygame|pygame==2.6.1
tetris|Tetris|Falling blocks with 7-bag randomiser, ghost piece and levels.|1.0.0|puzzle,classic,pyglet|pyglet==2.1.16
twenty48|2048|Slide and merge numbered tiles to reach 2048. Pure shapes, no assets.|1.0.0|arcade,puzzle,pyglet|pyglet==2.1.16'

gd_call() { # method path json
  curl -s -X "$1" "$API$2?tenant_id=$TENANT_ID"     -H "Content-Type: application/json" -H "$AUTH" -d "$3" > /dev/null 2>&1
}

# Prints the page JSON (empty when the page does not exist). Reading first
# keeps re-runs quiet: no duplicate POSTs, so no unique-key errors in the
# server log.
gd_page() { # path
  curl -sf "$API$1?tenant_id=$TENANT_ID" -H "$AUTH" 2>/dev/null
}

seed_games() {
  local name display desc ver tags pip base tj pj page
  while IFS='|' read -r name display desc ver tags pip; do
    base="/api/gamedep/game/$name"
    page=$(gd_page "$base")
    if [ -z "$page" ]; then
      gd_call POST /api/gamedep/game         "{\"name\":\"$name\",\"displayName\":\"$display\",\"description\":\"$desc\"}"
    fi
    # Everything below belongs to the revision: skip it when it exists
    # (publish is a toggle, so it must never run twice).
    case "$page" in *"\"version\":\"$ver\""*) continue ;; esac
    gd_call POST "$base/revisions"       "{\"version\":\"$ver\",\"moduleType\":\"python\"}"
    tj="\"${tags//,/\",\"}\""
    gd_call PUT "$base/tags" "{\"tags\":[$tj]}"
    pj="\"${pip//,/\",\"}\""
    gd_call PUT "$base/pip" "{\"pipRequirements\":[$pj]}"
    gd_call POST "$base/revisions/$ver/publish" "{}"
  done <<< "$GAMES"
  echo "    games registered for tenant $TENANT_ID"
}
