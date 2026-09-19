#!/usr/bin/env python3
"""Report client API calls that no backend controller route serves.

    python scripts/check_api_contract.py [--list]
Exit status 1 when any call has no matching route.
"""
import sys

from api_calls import collect
from api_paths import match
from api_routes import load


def check(routes, calls):
    return [(v, p, w) for v, p, w in calls if not match(v, p, routes)]


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    routes = load()
    calls = list(collect())
    bad = check(routes, calls)
    for verb, path, where in bad:
        print(f"MISSING {verb or '*':6} {path}  ({where})")
    print(f"{len(routes)} routes, {len(calls)} calls, {len(bad)} unmatched")
    if "--list" in argv:
        for r in sorted(routes):
            print(f"  {r[0]:6} {r[1]}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
