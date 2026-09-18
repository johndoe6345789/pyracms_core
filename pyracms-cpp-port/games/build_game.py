r"""Shared PyInstaller driver.

    python games/build_game.py snake         # build one game
    python games/build_game.py --all         # build every games/*/game.json

Output: games/<name>/dist/<name>[.exe]  (one-file, windowed).
Requires: pip install -r games/requirements-dev.txt \
    -r games/<name>/requirements.txt
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKIP = {"build.py", "conftest.py", "setup.py"}


def hidden_modules(game_dir, entry="main.py"):
    """Sibling modules of the entry script, imported dynamically by it."""
    return sorted(f[:-3] for f in os.listdir(game_dir)
                  if f.endswith(".py") and f != entry and f not in SKIP)


def build_command(game_dir, meta, onedir=False, platform=sys.platform):
    name, entry = meta["name"], meta.get("entry", "main.py")
    if platform == "darwin":  # ship dist/<name>.app instead of --onefile
        onedir = True
    work = os.path.join(game_dir, "build")
    cmd = [sys.executable, "-m", "PyInstaller", "--noconfirm", "--clean",
           "--onedir" if onedir else "--onefile", "--windowed",
           "--name", name, "--distpath", os.path.join(game_dir, "dist"),
           "--workpath", work, "--specpath", work, "--paths", game_dir]
    for mod in hidden_modules(game_dir, entry):
        cmd += ["--hidden-import", mod]
    if meta.get("engine") == "pyglet":  # backends load dynamically
        cmd += ["--collect-submodules", "pyglet"]
    return cmd + [os.path.join(game_dir, entry)]


def build(game_dir, onedir=False):
    with open(os.path.join(game_dir, "game.json"), encoding="utf-8") as f:
        meta = json.load(f)
    cmd = build_command(game_dir, meta, onedir)
    print("+", " ".join(cmd))
    return subprocess.call(cmd)


def all_games(root=HERE):
    return sorted(d for d in os.listdir(root)
                  if os.path.exists(os.path.join(root, d, "game.json")))


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("games", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--onedir", action="store_true")
    a = ap.parse_args(argv)
    names = all_games() if a.all else a.games
    if not names:
        ap.error("name a game or pass --all")
    rc = 0
    for n in names:
        rc |= build(os.path.join(HERE, n), a.onedir)
    return rc


if __name__ == "__main__":
    sys.exit(main())
