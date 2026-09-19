"""Attach a game's source archive to its revision (idempotent).

Same content (sha256) -> nothing to do. Changed content -> a new revision
<version>.<n>. A published revision without a source gets it in place.
"""
from __future__ import annotations

import os

from game_archive import build_zip


def _revisions(c, name, base):
    page = c.get_page("game", name) or {}
    return [r for r in page.get("revisions", [])
            if r["version"] == base or r["version"].startswith(base + ".")]


def _target_version(revs, base):
    if any(r["version"] == base and r.get("fileId") for r in revs):
        return f"{base}.{len(revs)}"
    return base


def attach_source(c, game, game_dir, work_dir):
    name, base = game["name"], game["version"]
    zpath = os.path.join(work_dir, f"{name}-{base}.zip")
    sha, size = build_zip(game_dir, zpath, name, game.get("entry", "main.py"))
    revs = _revisions(c, name, base)
    for r in revs:
        if r.get("sha256") == sha:
            c.ensure_published("game", name, r)
            return f"source {name} {r['version']} up to date ({sha[:12]})"
    ver = _target_version(revs, base)
    rev = c.ensure_revision("game", name, ver, game.get("moduleType", ""))
    up = c.upload_file(zpath)
    c.request("POST", f"/api/gamedep/game/{name}/revisions/{ver}/source",
              {"fileUuid": up["uuid"]})
    c.ensure_published("game", name, rev)
    return f"source {name} {ver} attached ({size} bytes, sha256 {sha})"
