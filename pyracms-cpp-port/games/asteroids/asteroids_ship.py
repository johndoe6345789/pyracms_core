"""The player ship. No pygame import."""
from __future__ import annotations

import math
from dataclasses import dataclass

from asteroids_geom import Body


@dataclass
class Ship(Body):
    angle: float = -math.pi / 2  # pointing up
    invuln: float = 2.0

    TURN = 4.0
    THRUST = 260.0
    MAX_SPEED = 380.0
    DRAG = 0.6

    def steer(self, dt, turn=0, thrust=False):
        """turn: -1 left, +1 right. Applies thrust, drag, speed cap."""
        self.angle += turn * self.TURN * dt
        if thrust:
            self.vx += math.cos(self.angle) * self.THRUST * dt
            self.vy += math.sin(self.angle) * self.THRUST * dt
        k = max(0.0, 1 - self.DRAG * dt)
        self.vx *= k
        self.vy *= k
        speed = math.hypot(self.vx, self.vy)
        if speed > self.MAX_SPEED:
            self.vx *= self.MAX_SPEED / speed
            self.vy *= self.MAX_SPEED / speed
        self.move(dt)
        self.invuln = max(0.0, self.invuln - dt)
