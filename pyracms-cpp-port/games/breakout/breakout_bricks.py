"""Brick grid helpers for Breakout (no pygame import)."""
from __future__ import annotations

from breakout_consts import BRICK_H, BRICK_W, COLS, ROWS, TOP


def new_bricks():
    return {(c, r) for c in range(COLS) for r in range(ROWS)}


def brick_rect(c, r):
    """(x, y, w, h) of the brick at column c, row r."""
    return c * BRICK_W, TOP + r * BRICK_H, BRICK_W, BRICK_H


def brick_points(r):
    """Top rows are worth more."""
    return (ROWS - r) * 10


def hit_brick(bricks, x, y, radius):
    """Return the first brick whose rect overlaps the ball, or None."""
    for c, r in sorted(bricks):
        bx, by, bw, bh = brick_rect(c, r)
        nx = max(bx, min(x, bx + bw))
        ny = max(by, min(y, by + bh))
        if (x - nx) ** 2 + (y - ny) ** 2 <= radius ** 2:
            return (c, r)
    return None
