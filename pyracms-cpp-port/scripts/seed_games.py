#!/usr/bin/env python3
"""Register games/*/game.json in a running backend (pages, 1.0.0-style revisions, tags, custom deps).
Binaries are attached later by CI via publish_manifest.py.

    python scripts/seed_games.py                       # http://localhost:8080, admin/password123 (seed.sh defaults)
    HN_API_URL=... HN_API_USERNAME=... HN_API_PASSWORD=... [HN_API_TENANT=slug] python scripts/seed_games.py

Accounts are per-tenant: pass HN_API_TENANT to log in as a tenant user. Site owners are platform accounts with no
tenant, so leave it unset for them (the seed.sh admin is one). HN_API_TOKEN skips login. Idempotent.
"""
from __future__ import annotations

import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import hn_api  # noqa: E402

GAMES = os.path.join(HERE, "..", "games")


def main() -> int:
    env = dict(os.environ)
    env.setdefault("HN_API_URL", "http://localhost:8080")
    if not env.get("HN_API_TOKEN"):
        env.setdefault("HN_API_USERNAME", "admin")
        env.setdefault("HN_API_PASSWORD", "password123")
    try:
        c = hn_api.env_client(env)
    except (hn_api.ApiError, OSError) as e:
        print(f"ERROR: cannot reach/login to backend: {e}", file=sys.stderr)
        return 1
    if c is None:
        print("ERROR: no credentials", file=sys.stderr)
        return 1
    for path in sorted(glob.glob(os.path.join(GAMES, "*", "game.json"))):
        g = json.load(open(path, encoding="utf-8"))
        c.ensure_page("game", g["name"], g["displayName"], g["description"])
        rev = c.ensure_revision("game", g["name"], g["version"], g.get("moduleType", "python"))
        c.request("PUT", f"/api/gamedep/game/{g['name']}/tags", {"tags": g.get("tags", [])})
        for d in g.get("dependencies", []):
            c.ensure_page("dep", d["name"], d.get("displayName", d["name"]), d.get("description", ""))
            drev = c.ensure_revision("dep", d["name"], d["version"], d.get("moduleType", "python-package"))
            c.ensure_published("dep", d["name"], drev)
            try:
                c.request("POST", f"/api/gamedep/game/{g['name']}/dependencies", {"depRevisionId": drev["id"]})
            except hn_api.ApiError as e:
                if e.status not in (400, 409):
                    raise
        c.ensure_published("game", g["name"], rev)
        print(f"registered {g['name']} {g['version']} (pip: {', '.join(g.get('pipRequirements', [])) or '-'})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
