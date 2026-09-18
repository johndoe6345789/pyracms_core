"""Merge manifests into a Hypernucleus-style catalogue (stdlib only)."""
from __future__ import annotations

import json


def _game_entry(m):
    return {
        "name": m["name"], "display_name": m["displayName"],
        "description": m["description"], "tags": m["tags"],
        "pip_requirements": m["pipRequirements"],
        "dependencies": [{"dependency": d["name"], "version": d["version"]}
                         for d in m["dependencies"]],
        "revisions": {}}


def _binary(m):
    return {"binary": m["url"], "operating_system": m["os"],
            "architecture": m["arch"], "name": m["file"],
            "sha256": m["sha256"], "size": m["size"]}


def merge(paths, out):
    games = {}
    for p in paths:
        with open(p, encoding="utf-8") as f:
            m = json.load(f)
        g = games.setdefault((m["kind"], m["name"]), _game_entry(m))
        rev = g["revisions"].setdefault(
            m["version"], {"version": m["version"],
                           "moduletype": m["moduleType"], "binaries": []})
        rev["binaries"].append(_binary(m))
    items = []
    for (kind, _), g in sorted(games.items()):
        g["revisions"] = list(g["revisions"].values())
        items.append({("game" if kind == "game" else "launcher"): g})
    doc = {"schemaVersion": 1, "gamedep": items}
    with open(out, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, sort_keys=True)
    return doc
