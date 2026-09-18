"""Build one artifact manifest dict (stdlib only)."""
from __future__ import annotations

import datetime
import json
import os

from manifest_util import norm_arch, norm_os, sha256_of


def load_meta(a):
    if a.kind == "game":
        with open(os.path.join(a.game_dir, "game.json"),
                  encoding="utf-8") as f:
            return json.load(f)
    return {"name": a.name, "displayName": a.display_name or a.name,
            "description": a.description or "", "version": a.version,
            "moduleType": "native", "engine": "qt6", "tags": ["launcher"]}


def resolve_deps(meta, game_dir):
    """Custom (non-pip) PyraCMS dependency packages, with file hashes."""
    deps = []
    for d in meta.get("dependencies", []):
        d = dict(d)
        f = d.get("file") and os.path.join(game_dir or ".", d["file"])
        if f and os.path.exists(f):
            d["sha256"], d["size"] = sha256_of(f), os.path.getsize(f)
        deps.append(d)
    return deps


def build(a) -> dict:
    meta = load_meta(a)
    if a.version:
        meta["version"] = a.version
    now = datetime.datetime.now(datetime.timezone.utc)
    return {
        "schemaVersion": 1, "kind": a.kind, "name": meta["name"],
        "displayName": meta.get("displayName", meta["name"]),
        "description": meta.get("description", ""),
        "version": meta["version"],
        "moduleType": meta.get("moduleType", ""),
        "engine": meta.get("engine", ""), "tags": meta.get("tags", []),
        "entry": meta.get("entry", ""),
        "pipRequirements": meta.get("pipRequirements", []),
        "dependencies": resolve_deps(meta, a.game_dir),
        "os": norm_os(a.os), "arch": norm_arch(a.arch),
        "file": os.path.basename(a.file), "sha256": sha256_of(a.file),
        "size": os.path.getsize(a.file), "url": a.url or "",
        "createdAt": now.isoformat(timespec="seconds"),
    }
