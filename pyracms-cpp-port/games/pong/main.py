"""Pong (pyglet). W/S move vs the CPU, or Up/Down with --two-player.
P pause, R restart, Esc quit."""
import os
import sys

import pyglet

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pong_window import PongWindow  # noqa: E402


def main():
    PongWindow(two_player="--two-player" in sys.argv)
    pyglet.app.run()


if __name__ == "__main__":
    main()
