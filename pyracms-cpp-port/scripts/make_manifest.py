#!/usr/bin/env python3
r"""Write a per-artifact manifest JSON (stdlib only).

  make_manifest.py game --game-dir games/snake --file dist/snake \
      --os lin --arch x86_64 --url URL
  make_manifest.py launcher --name hypernucleus --version 0.1.0 \
      --file hypernucleus-lin-x86_64.tar.gz --os lin --arch x86_64
  make_manifest.py merge manifests/*.json --out catalog.json

Naming follows the Hypernucleus catalogue: os = win|mac|lin|pi,
arch = x86_64|arm64 (the publisher maps arm64 -> arm, override with
HN_ARM64_ARCH_NAME). `merge` emits {"gamedep":[{"game":{...}}]}.
"""
from __future__ import annotations

import argparse
import json
import sys

from manifest_build import build
from manifest_merge import merge


def add_artifact_args(p):
    p.add_argument("--file", required=True)
    p.add_argument("--os", required=True)
    p.add_argument("--arch", required=True)
    p.add_argument("--url", default="")
    p.add_argument("--version", default="")
    p.add_argument("--out", default="")


def make_parser():
    ap = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    game = sub.add_parser("game")
    add_artifact_args(game)
    game.add_argument("--game-dir", required=True)
    launcher = sub.add_parser("launcher")
    add_artifact_args(launcher)
    launcher.add_argument("--name", default="hypernucleus")
    launcher.add_argument("--display-name", default="Hypernucleus")
    launcher.add_argument("--description",
                          default="Hypernucleus game launcher")
    launcher.set_defaults(game_dir="")
    m = sub.add_parser("merge")
    m.add_argument("manifests", nargs="+")
    m.add_argument("--out", required=True)
    return ap


def main(argv=None) -> int:
    a = make_parser().parse_args(argv)
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
