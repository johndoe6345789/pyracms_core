"""Pure ball helpers for Pong (no pyglet import)."""
from __future__ import annotations

import math

from pong_consts import (BALL_MAX, BALL_R, BALL_START, H, PADDLE_H,
                         PADDLE_W)


def serve_velocity(rng, direction):
    a = rng.uniform(-0.5, 0.5)
    return (math.cos(a) * BALL_START * direction,
            math.sin(a) * BALL_START)


def paddle_hit(bx, by, px, py):
    return (abs(bx - px) <= PADDLE_W / 2 + BALL_R
            and abs(by - py) <= PADDLE_H / 2 + BALL_R)


def bounce_velocity(by, py, vx, vy, going_right):
    """Angle depends on where the ball hit the paddle; speed grows."""
    rel = max(-1.0, min(1.0, (by - py) / (PADDLE_H / 2)))
    speed = min(math.hypot(vx, vy) * 1.06, BALL_MAX)
    ang = rel * math.radians(55)
    return (math.cos(ang) * speed * (1 if going_right else -1),
            math.sin(ang) * speed)


def wall_bounce(by, bvy):
    """Reflect off the top/bottom walls. Returns (by, bvy)."""
    if by < BALL_R:
        return BALL_R, abs(bvy)
    if by > H - BALL_R:
        return H - BALL_R, -abs(bvy)
    return by, bvy
