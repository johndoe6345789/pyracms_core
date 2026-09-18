"""Pure logic for an Asteroids-like game. No pygame import."""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field

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


@dataclass
class Ship(Body):
    angle: float = -math.pi / 2  # pointing up
    invuln: float = 2.0

    TURN = 4.0
    THRUST = 260.0
    MAX_SPEED = 380.0
    DRAG = 0.6


@dataclass
class AsteroidsGame:
    seed: int | None = None
    ship: Ship = None
    asteroids: list = field(default_factory=list)
    bullets: list = field(default_factory=list)
    score: int = 0
    lives: int = 3
    level: int = 1
    game_over: bool = False
    paused: bool = False
    cooldown: float = 0.0

    def __post_init__(self):
        self.rng = random.Random(self.seed)
        self.reset()

    def reset(self):
        self.ship = Ship(W / 2, H / 2, r=12.0)
        self.bullets, self.score, self.lives, self.level = [], 0, 3, 1
        self.game_over = self.paused = False
        self.cooldown = 0.0
        self.spawn_wave()

    def spawn_wave(self):
        self.asteroids = []
        for _ in range(3 + self.level):
            while True:  # keep away from the ship
                x, y = self.rng.uniform(0, W), self.rng.uniform(0, H)
                if not circles_hit(x, y, SIZE_RADIUS[3], self.ship.x, self.ship.y, 140):
                    break
            self.asteroids.append(self._make(x, y, 3))

    def _make(self, x, y, size):
        a = self.rng.uniform(0, math.tau)
        sp = self.rng.uniform(30, 70) * (1 + (3 - size) * 0.5) + self.level * 4
        return Asteroid(x, y, math.cos(a) * sp, math.sin(a) * sp, SIZE_RADIUS[size],
                        size, self.rng.uniform(-1.5, 1.5), self.rng.uniform(0, math.tau))

    def toggle_pause(self):
        if not self.game_over:
            self.paused = not self.paused

    def shoot(self):
        if self.game_over or self.paused or self.cooldown > 0 or len(self.bullets) >= 6:
            return False
        s = self.ship
        c, sn = math.cos(s.angle), math.sin(s.angle)
        self.bullets.append(Bullet(s.x + c * s.r, s.y + sn * s.r, s.vx + c * 560, s.vy + sn * 560, 2.0))
        self.cooldown = 0.2
        return True

    def split(self, a: Asteroid):
        """Return children for a destroyed asteroid."""
        if a.size == 1:
            return []
        return [self._make(a.x, a.y, a.size - 1) for _ in range(2)]

    def update(self, dt, turn=0, thrust=False):
        """turn: -1 left, +1 right."""
        if self.game_over or self.paused:
            return
        s = self.ship
        s.angle += turn * Ship.TURN * dt
        if thrust:
            s.vx += math.cos(s.angle) * Ship.THRUST * dt
            s.vy += math.sin(s.angle) * Ship.THRUST * dt
        k = max(0.0, 1 - Ship.DRAG * dt)
        s.vx *= k
        s.vy *= k
        sp = math.hypot(s.vx, s.vy)
        if sp > Ship.MAX_SPEED:
            s.vx, s.vy = s.vx / sp * Ship.MAX_SPEED, s.vy / sp * Ship.MAX_SPEED
        s.move(dt)
        s.invuln = max(0.0, s.invuln - dt)
        self.cooldown = max(0.0, self.cooldown - dt)
        for a in self.asteroids:
            a.move(dt)
            a.angle += a.spin * dt
        for b in self.bullets:
            b.move(dt)
            b.ttl -= dt
        self.bullets = [b for b in self.bullets if b.ttl > 0]
        self._collide()
        if not self.asteroids and not self.game_over:
            self.level += 1
            self.spawn_wave()

    def _collide(self):
        for b in list(self.bullets):
            for a in list(self.asteroids):
                if circles_hit(b.x, b.y, b.r, a.x, a.y, a.r):
                    self.bullets.remove(b)
                    self.asteroids.remove(a)
                    self.asteroids.extend(self.split(a))
                    self.score += SIZE_SCORE[a.size]
                    break
        if self.ship.invuln > 0:
            return
        for a in self.asteroids:
            if circles_hit(self.ship.x, self.ship.y, self.ship.r, a.x, a.y, a.r):
                self.lives -= 1
                if self.lives <= 0:
                    self.game_over = True
                else:
                    self.ship = Ship(W / 2, H / 2, r=12.0)
                return
