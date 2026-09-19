#!/usr/bin/env python3
"""Repo-wide limits: <=80 lines per file, <=80 columns per line.

Scans git-tracked source files and reports violations grouped by area.
Exit status 1 when anything exceeds a limit and --strict is given.

    python scripts/check_limits.py [--strict] [--list] [--area PREFIX]
"""
import argparse
import sys

from limits_scan import scan


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
