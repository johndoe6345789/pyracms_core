"""Tetris (pyglet). Left/Right, Up rotate, Down, Space drop, P, R."""
import os
import sys

import pyglet

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tetris_window import TetrisWindow  # noqa: E402


def main():
    TetrisWindow()
    pyglet.app.run()


if __name__ == "__main__":
    main()
