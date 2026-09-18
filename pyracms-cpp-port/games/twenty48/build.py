"""Build a standalone binary: python build.py (see requirements-dev.txt)."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))
from build_game import build  # noqa: E402

if __name__ == "__main__":
    sys.exit(build(HERE))
