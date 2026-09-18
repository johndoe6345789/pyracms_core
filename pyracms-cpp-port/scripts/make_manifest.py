#!/usr/bin/env python3
"""Write a per-artifact manifest JSON (stdlib only).

    make_manifest.py game --game-dir games/snake --file dist/snake --os lin --arch x86_64 --url URL
    make_manifest.py launcher --name hypernucleus --version 0.1.0 --file hypernucleus-lin-x86_64.tar.gz ...
    make_manifest.py merge manifests/*.json --out catalog.json

Manifest fields: schemaVersion, kind (game|launcher), name, displayName, description, version, moduleType,
engine, tags, entry, pipRequirements, dependencies, os, arch, file, sha256, size, url, createdAt.

Naming follows the original Hypernucleus catalogue (hypernucleusserver outputlib.show_json):
  os   = win | mac | lin | pi        (operating_systems.name)
  arch = x86_64 | arm64              (CI name; the backend table only has 'arm' so the publisher maps
                                      arm64 -> arm, override with HN_ARM64_ARCH_NAME)
`merge` emits a catalogue shaped like that catalogue's {"gamedep":[{"game":{...,"revisions":[{"binaries":[]}]}}]}.
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import os
import sys

OS_ALIASES = {"windows": "win", "win": "win", "win32": "win", "macos": "mac", "mac": "mac", "darwin": "mac",
              "linux": "lin", "lin": "lin"}
ARCH_ALIASES = {"x64": "x86_64", "x86_64": "x86_64", "amd64": "x86_64", "arm64": "arm64", "aarch64": "arm64"}


def norm_os(v):
    return OS_ALIASES[v.lower()]


def norm_arch(v):
    return ARCH_ALIASES[v.lower()]


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def build(a) -> dict:
    meta = {}
    if a.kind == "game":
        meta = json.load(open(os.path.join(a.game_dir, "game.json"), encoding="utf-8"))
    else:
        meta = {"name": a.name, "displayName": a.display_name or a.name, "description": a.description or "",
                "version": a.version, "moduleType": "native", "engine": "qt6", "tags": ["launcher"]}
    if a.version:
        meta["version"] = a.version
    deps = []
    for d in meta.get("dependencies", []):  # custom (non-pip) PyraCMS dependency packages
        d = dict(d)
        f = d.get("file") and os.path.join(a.game_dir or ".", d["file"])
        if f and os.path.exists(f):
            d["sha256"], d["size"] = sha256_of(f), os.path.getsize(f)
        deps.append(d)
    return {
        "schemaVersion": 1, "kind": a.kind, "name": meta["name"], "displayName": meta.get("displayName", meta["name"]),
        "description": meta.get("description", ""), "version": meta["version"],
        "moduleType": meta.get("moduleType", ""), "engine": meta.get("engine", ""),
        "tags": meta.get("tags", []), "entry": meta.get("entry", ""),
        "pipRequirements": meta.get("pipRequirements", []), "dependencies": deps,
        "os": norm_os(a.os), "arch": norm_arch(a.arch),
        "file": os.path.basename(a.file), "sha256": sha256_of(a.file), "size": os.path.getsize(a.file),
        "url": a.url or "",
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
    }


def merge(paths, out):
    games = {}
    for p in paths:
        m = json.load(open(p, encoding="utf-8"))
        g = games.setdefault((m["kind"], m["name"]), {
            "name": m["name"], "display_name": m["displayName"], "description": m["description"],
            "tags": m["tags"], "pip_requirements": m["pipRequirements"],
            "dependencies": [{"dependency": d["name"], "version": d["version"]} for d in m["dependencies"]],
            "revisions": {}})
        rev = g["revisions"].setdefault(m["version"], {"version": m["version"], "moduletype": m["moduleType"],
                                                       "binaries": []})
        rev["binaries"].append({"binary": m["url"], "operating_system": m["os"], "architecture": m["arch"],
                                "name": m["file"], "sha256": m["sha256"], "size": m["size"]})
    items = []
    for (kind, _), g in sorted(games.items()):
        g["revisions"] = list(g["revisions"].values())
        items.append({("game" if kind == "game" else "launcher"): g})
    doc = {"schemaVersion": 1, "gamedep": items}
    with open(out, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, sort_keys=True)
    return doc


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for kind in ("game", "launcher"):
        p = sub.add_parser(kind)
        p.add_argument("--file", required=True)
        p.add_argument("--os", required=True)
        p.add_argument("--arch", required=True)
        p.add_argument("--url", default="")
        p.add_argument("--version", default="")
        p.add_argument("--out", default="")
        if kind == "game":
            p.add_argument("--game-dir", required=True)
        else:
            p.add_argument("--name", default="hypernucleus")
            p.add_argument("--display-name", default="Hypernucleus")
            p.add_argument("--description", default="Hypernucleus game launcher")
            p.set_defaults(game_dir="")
    m = sub.add_parser("merge")
    m.add_argument("manifests", nargs="+")
    m.add_argument("--out", required=True)
    a = ap.parse_args(argv)
    if a.cmd == "merge":
        merge(a.manifests, a.out)
        return 0
    a.kind = a.cmd
    m = build(a)
    out = a.out or f"{m['file']}.manifest.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(m, f, indent=2)
        f.write("\n")
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
