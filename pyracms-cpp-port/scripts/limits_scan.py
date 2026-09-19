"""Scanning half of check_limits: find files and count violations."""

import subprocess
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
EXTS = {".cpp", ".h", ".hpp", ".ts", ".tsx", ".js", ".py", ".qml"}
MAX_LINES = 80
MAX_COLS = 80
# Generated or vendored files are exempt from the limits.
SKIP_PARTS = ("node_modules/", "/build/", ".next/", "package-lock.json",
              # Qt Linguist catalogs (.ts here is XML, not TypeScript)
              "client/translations/")
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
