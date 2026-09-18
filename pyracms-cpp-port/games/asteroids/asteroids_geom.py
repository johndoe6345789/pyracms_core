"""Bodies and geometry helpers for Asteroids. No pygame import."""
from __future__ import annotations

from dataclasses import dataclass

W, H = 900, 640
SIZE_RADIUS = {3: 46.0, 2: 26.0, 1: 14.0}
SIZE_SCORE = {3: 20, 2: 50, 1: 100}


def wrap(x: float, y: float, w: float = W, h: float = H):
    return x % w, y % h


def circles_hit(ax, ay, ar, bx, by, br) -> bool:
    return (ax - bx) ** 2 + (ay - by) ** 2 <= (ar + br) ** 2


@dataclass
class Body:
    x: float
    y: float
    vx: float = 0.0
    vy: float = 0.0
    r: float = 10.0

    def move(self, dt):
        self.x, self.y = wrap(self.x + self.vx * dt, self.y + self.vy * dt)


@dataclass
class Bullet(Body):
    ttl: float = 1.1


@dataclass
class Asteroid(Body):
    size: int = 3
    spin: float = 0.0
    angle: float = 0.0
