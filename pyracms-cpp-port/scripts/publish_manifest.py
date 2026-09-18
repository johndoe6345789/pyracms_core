#!/usr/bin/env python3
"""Publish artifact manifests (make_manifest.py output) to the backend GameDep API (stdlib only).

    HN_API_URL=https://cms.example.com HN_API_TOKEN=... \
        python scripts/publish_manifest.py --files-dir artifacts 'artifacts/**/*.manifest.json'

Auth: HN_API_TOKEN (JWT) or HN_API_USERNAME/HN_API_PASSWORD [+ HN_API_TENANT; platform/site-owner accounts
have no tenant]. If HN_API_URL or credentials are missing this prints a notice and exits 0, so CI stays green
on forks. Use --dry-run to print the plan without touching the API.

Per manifest: ensure the game (type 'game') and any custom dependency (type 'dep') pages and revisions, upload
the binary via POST /api/files, attach it with the manifest's os/arch, link dependencies, publish the revision.
Launcher manifests (kind=launcher) are registered as type 'dep' pages named after the launcher so the update
channel is visible in the catalogue; pass --skip-launcher to ignore them. The operation is idempotent: pages and
revisions are reused, and a binary already attached for the same os/arch is skipped (HTTP 409).
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import sys
import tempfile
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hn_api  # noqa: E402


def backend_arch(arch: str) -> str:
    # backend architectures table (007_hypernucleus.sql) has no arm64 row; 'arm' (ARM LE) is the closest.
    return os.environ.get("HN_ARM64_ARCH_NAME", "arm") if arch == "arm64" else arch


def resolve_file(m: dict, files_dir: str | None) -> str:
    if files_dir:
        for root, _, names in os.walk(files_dir):
            if m["file"] in names:
                return os.path.join(root, m["file"])
    if m.get("url"):
        tmp = os.path.join(tempfile.mkdtemp(), m["file"])
        urllib.request.urlretrieve(m["url"], tmp)
        return tmp
    raise FileNotFoundError(f"{m['file']} not found in --files-dir and manifest has no url")


def attach_binary(c, type_, name, version, path, os_name, arch_name, os_ids, arch_ids):
    up = c.upload_file(path)
    fid = c.file_id(up["uuid"])
    try:
        c.request("POST", f"/api/gamedep/{type_}/{name}/revisions/{version}/binaries",
                  {"osId": os_ids[os_name], "archId": arch_ids[arch_name], "fileId": fid})
    except hn_api.ApiError as e:
        if e.status != 409:
            raise
        print(f"  binary for {os_name}/{arch_name} already attached, skipping")


def publish_one(c, m, files_dir, os_ids, arch_ids):
    type_ = "game" if m["kind"] == "game" else "dep"
    name = m["name"]
    print(f"- {type_} {name} {m['version']} {m['os']}/{m['arch']}")
    c.ensure_page(type_, name, m["displayName"], m["description"])
    rev = c.ensure_revision(type_, name, m["version"], m.get("moduleType", ""))
    if m.get("tags"):
        c.request("PUT", f"/api/gamedep/{type_}/{name}/tags", {"tags": m["tags"]})
    attach_binary(c, type_, name, m["version"], resolve_file(m, files_dir),
                  m["os"], backend_arch(m["arch"]), os_ids, arch_ids)
    for d in m.get("dependencies", []):  # custom (non-pip) packages, stored as type 'dep'
        c.ensure_page("dep", d["name"], d.get("displayName", d["name"]), d.get("description", ""))
        drev = c.ensure_revision("dep", d["name"], d["version"], d.get("moduleType", "python-package"))
        src = d.get("file") and os.path.join(files_dir or ".", d["file"])
        if src and os.path.exists(src):
            attach_binary(c, "dep", d["name"], d["version"], src, "pi", "pi", os_ids, arch_ids)
        c.ensure_published("dep", d["name"], drev)
        try:
            c.request("POST", f"/api/gamedep/{type_}/{name}/dependencies", {"depRevisionId": drev["id"]})
        except hn_api.ApiError as e:
            if e.status not in (409, 400):
                raise
    c.ensure_published(type_, name, rev)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("manifests", nargs="+", help="manifest files or globs")
    ap.add_argument("--files-dir", help="directory containing the binaries named in the manifests")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip-launcher", action="store_true")
    a = ap.parse_args(argv)

    paths = sorted({p for pat in a.manifests for p in glob.glob(pat, recursive=True)})
    manifests = [json.load(open(p, encoding="utf-8")) for p in paths]
    if a.skip_launcher:
        manifests = [m for m in manifests if m["kind"] != "launcher"]
    if not manifests:
        print("No manifests found; nothing to publish.")
        return 0
    if a.dry_run:
        for m in manifests:
            print(f"[dry-run] {m['kind']} {m['name']} {m['version']} {m['os']}/{m['arch']} "
                  f"sha256={m['sha256'][:12]} size={m['size']} deps={[d['name'] for d in m['dependencies']]}")
        return 0
    try:
        c = hn_api.env_client()
    except hn_api.ApiError as e:
        print(f"Login failed: {e}", file=sys.stderr)
        return 1
    if c is None:
        print("HN_API_URL / credentials not set; skipping publish to the GameDep API.")
        return 0
    os_ids, arch_ids = c.lookup("operating-systems"), c.lookup("architectures")
    for m in manifests:
        publish_one(c, m, a.files_dir, os_ids, arch_ids)
    print(f"Published {len(manifests)} manifest(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
