"""Shared PyInstaller driver.

    python games/build_game.py snake            # build one game
    python games/build_game.py --all            # build every games/*/game.json

Output: games/<name>/dist/<name>[.exe]  (one-file, windowed).
Requires: pip install -r games/requirements-dev.txt -r games/<name>/requirements.txt
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def build(game_dir: str, onedir: bool = False) -> int:
    meta = json.load(open(os.path.join(game_dir, "game.json"), encoding="utf-8"))
    name = meta["name"]
    if sys.platform == "darwin":
        onedir = True  # PyInstaller deprecates --onefile --windowed on macOS; we ship dist/<name>.app
    logic = [f for f in os.listdir(game_dir) if f.endswith("_logic.py")]
    cmd = [sys.executable, "-m", "PyInstaller", "--noconfirm", "--clean",
           "--onedir" if onedir else "--onefile", "--windowed", "--name", name,
           "--distpath", os.path.join(game_dir, "dist"),
           "--workpath", os.path.join(game_dir, "build"),
           "--specpath", os.path.join(game_dir, "build"),
           "--paths", game_dir]
    for mod in logic:
        cmd += ["--hidden-import", mod[:-3]]
    if meta.get("engine") == "pyglet":
        # pyglet loads its platform backends dynamically.
        cmd += ["--collect-submodules", "pyglet"]
    cmd.append(os.path.join(game_dir, meta.get("entry", "main.py")))
    print("+", " ".join(cmd))
    return subprocess.call(cmd)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("games", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--onedir", action="store_true")
    a = ap.parse_args()
    names = a.games
    if a.all:
        names = sorted(d for d in os.listdir(HERE) if os.path.exists(os.path.join(HERE, d, "game.json")))
    if not names:
        ap.error("name a game or pass --all")
    rc = 0
    for n in names:
        rc |= build(os.path.join(HERE, n), a.onedir)
    return rc


if __name__ == "__main__":
    sys.exit(main())
