"""Pure ball physics helpers for Breakout (no pygame import)."""
from __future__ import annotations

import math

from breakout_consts import BALL_MAX, BALL_R, PADDLE_W, W


def paddle_bounce(bx, paddle_x, vx, vy):
    """New (vx, vy): angle follows the hit point, speed grows a little."""
    speed = min(math.hypot(vx, vy) * 1.02, BALL_MAX)
    rel = max(-1.0, min(1.0, (bx - paddle_x) / (PADDLE_W / 2)))
    ang = rel * math.radians(60)
    return math.sin(ang) * speed, -math.cos(ang) * speed


def wall_reflect(bx, by, vx, vy):
    """Reflect off the side walls and ceiling. Returns (bx, by, vx, vy)."""
    if bx < BALL_R or bx > W - BALL_R:
        bx, vx = max(BALL_R, min(W - BALL_R, bx)), -vx
    if by < BALL_R:
        by, vy = BALL_R, abs(vy)
    return bx, by, vx, vy
