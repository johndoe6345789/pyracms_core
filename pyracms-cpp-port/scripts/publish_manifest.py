#!/usr/bin/env python3
r"""Publish artifact manifests to the backend GameDep API (stdlib only).

  HN_API_URL=https://cms.example.com HN_API_TOKEN=... python \
      scripts/publish_manifest.py --files-dir artifacts \
      'artifacts/**/*.manifest.json'

Auth: HN_API_TOKEN or HN_API_USERNAME/HN_API_PASSWORD [+ HN_API_TENANT].
Without HN_API_URL/credentials it exits 0 (so CI on forks stays green).
--dry-run prints the plan; --skip-launcher ignores launcher manifests.
Per manifest: ensure page + revision (game or dep), upload and attach the
binary for its os/arch, link custom deps, publish. Idempotent (409 = skip).
"""
from __future__ import annotations

import argparse
import glob
import json
import sys
from pathlib import Path

import hn_env
from hn_errors import ApiError
from publish_one import publish_one


def load_manifests(patterns, skip_launcher=False):
    paths = sorted({p for pat in patterns
                    for p in glob.glob(pat, recursive=True)})
    out = [json.loads(Path(p).read_text("utf-8")) for p in paths]
    if skip_launcher:
        out = [m for m in out if m["kind"] != "launcher"]
    return out


def describe(m):
    return (f"[dry-run] {m['kind']} {m['name']} {m['version']} "
            f"{m['os']}/{m['arch']} sha256={m['sha256'][:12]} "
            f"size={m['size']}")


def parse_args(argv):
    ap = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("manifests", nargs="+", help="manifest files or globs")
    ap.add_argument("--files-dir", help="directory holding the binaries")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip-launcher", action="store_true")
    return ap.parse_args(argv)


def main(argv=None) -> int:
    a = parse_args(argv)
    manifests = load_manifests(a.manifests, a.skip_launcher)
    if not manifests:
        print("No manifests found; nothing to publish.")
        return 0
    if a.dry_run:
        for m in manifests:
            print(describe(m))
        return 0
    try:
        c = hn_env.env_client()
    except ApiError as e:
        print(f"Login failed: {e}", file=sys.stderr)
        return 1
    if c is None:
        print("HN_API_URL / credentials not set; skipping publish.")
        return 0
    os_ids, arch_ids = (c.lookup("operating-systems"),
                        c.lookup("architectures"))
    for m in manifests:
        publish_one(c, m, a.files_dir, os_ids, arch_ids)
    print(f"Published {len(manifests)} manifest(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
