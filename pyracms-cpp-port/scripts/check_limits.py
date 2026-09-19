#!/usr/bin/env python3
"""Repo-wide limits: <=80 lines per file, <=80 columns per line.

Scans git-tracked source files and reports violations grouped by area.
Exit status 1 when anything exceeds a limit and --strict is given.

    python scripts/check_limits.py [--strict] [--list] [--area PREFIX]
"""
import argparse
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
EXTS = {".cpp", ".h", ".hpp", ".ts", ".tsx", ".js", ".py", ".qml"}
MAX_LINES = 80
MAX_COLS = 80
# Generated or vendored files are exempt from the limits.
SKIP_PARTS = ("node_modules/", "/build/", ".next/", "package-lock.json")
SKIP_NAMES = {"CMakeLists.txt", "next-env.d.ts"}
# The original Pyramid app is kept for reference and is not the live code.
LEGACY = ("pyracms/", "tools/", "setup.py")


def tracked():
    out = subprocess.run(
        ["git", "ls-files"], cwd=REPO, capture_output=True, text=True,
        check=True).stdout.splitlines()
    for name in out:
        path = Path(name)
        if path.suffix not in EXTS or path.name in SKIP_NAMES:
            continue
        if name.startswith(LEGACY):
            continue
        if any(part in "/" + name for part in SKIP_PARTS):
            continue
        yield name


def area(name):
    parts = name.split("/")
    if len(parts) > 3 and parts[0] == "pyracms-cpp-port":
        return "/".join(parts[1:3])
    return "/".join(parts[:2])


def scan(prefix):
    stats = defaultdict(lambda: [0, 0, 0, 0])  # files, long, wide, filesall
    detail = []
    for name in tracked():
        if prefix and not name.startswith(prefix):
            continue
        try:
            lines = (REPO / name).read_text(
                encoding="utf-8", errors="replace").splitlines()
        except FileNotFoundError:
            continue
        wide = sum(1 for ln in lines if len(ln.expandtabs(4)) > MAX_COLS)
        long_ = len(lines) > MAX_LINES
        s = stats[area(name)]
        s[3] += 1
        s[1] += long_
        s[2] += 1 if wide else 0
        if long_ or wide:
            s[0] += 1
            detail.append((name, len(lines), wide))
    return stats, detail


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--area", default="")
    args = ap.parse_args()
    stats, detail = scan(args.area)
    total = sum(s[3] for s in stats.values())
    bad = sum(s[0] for s in stats.values())
    print(f"{'area':44} {'files':>6} {'>80 lines':>10} {'>80 cols':>9}")
    for key in sorted(stats):
        f, lg, w, n = stats[key][0], stats[key][1], stats[key][2], stats[key][3]
        print(f"{key:44} {n:>6} {lg:>10} {w:>9}")
    print(f"\n{bad} of {total} files break a limit")
    if args.list:
        for name, n, w in sorted(detail):
            print(f"  {name}: {n} lines, {w} wide lines")
    if args.strict and bad:
        sys.exit(1)


if __name__ == "__main__":
    main()
