"""Build a standalone binary for this game: python build.py  (needs games/requirements-dev.txt)."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from build_game import build  # noqa: E402

if __name__ == "__main__":
    sys.exit(build(os.path.dirname(os.path.abspath(__file__))))
