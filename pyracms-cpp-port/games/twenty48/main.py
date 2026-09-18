"""2048 (pyglet). Arrows/WASD slide the tiles, R restarts, Esc quits."""
import os
import sys

import pyglet

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from twenty48_window import Window2048  # noqa: E402


def main():
    Window2048()
    pyglet.app.run()


if __name__ == "__main__":
    main()
