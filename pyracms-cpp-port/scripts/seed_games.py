#!/usr/bin/env python3
r"""Register games/*/game.json in a running backend (pages, revisions, tags,
custom deps). Binaries are attached later by CI via publish_manifest.py.

  python scripts/seed_games.py            # localhost:8080, admin/password123
  HN_API_URL=... HN_API_USERNAME=... HN_API_PASSWORD=... \
      [HN_API_TENANT=slug] python scripts/seed_games.py

Accounts are per tenant: pass HN_API_TENANT for a tenant user. Site owners
are platform accounts with no tenant, so leave it unset (the seed.sh admin
is one). HN_API_TOKEN skips login. Idempotent.
"""
from __future__ import annotations

import glob
import json
import os
import sys
from urllib.parse import urlparse

import hn_env
from hn_errors import ApiError
from seed_register import register_game

HERE = os.path.dirname(os.path.abspath(__file__))
GAMES = os.path.join(HERE, "..", "games")


def seed_env(environ=os.environ):
    env = dict(environ)
    env.setdefault("HN_API_URL", "http://localhost:8080")
    if not env.get("HN_API_TOKEN"):
        env.setdefault("HN_API_USERNAME", "admin")
        # The dev seed password is only assumed for a loopback backend; any
        # other host must be given HN_API_PASSWORD (or HN_API_TOKEN).
        host = urlparse(env["HN_API_URL"]).hostname or ""
        if host in ("localhost", "127.0.0.1", "::1"):
            env.setdefault("HN_API_PASSWORD", "password123")
    return env


def main(games_dir=GAMES) -> int:
    try:
        c = hn_env.env_client(seed_env())
    except (ApiError, OSError) as e:
        print(f"ERROR: cannot reach/login to backend: {e}", file=sys.stderr)
        return 1
    if c is None:
        print("ERROR: no credentials", file=sys.stderr)
        return 1
    for path in sorted(glob.glob(os.path.join(games_dir, "*", "game.json"))):
        with open(path, encoding="utf-8") as f:
            print(register_game(c, json.load(f)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
