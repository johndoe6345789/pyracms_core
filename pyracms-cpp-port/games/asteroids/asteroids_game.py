"""Asteroids game state and rules. No pygame import."""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field

from asteroids_collide import bullets_vs_rocks, ship_vs_rocks
from asteroids_geom import H, W, Bullet
from asteroids_ship import Ship
from asteroids_spawn import spawn_wave


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

    def respawn_ship(self):
        self.ship = Ship(W / 2, H / 2, r=12.0)

    def reset(self):
        self.respawn_ship()
        self.bullets, self.score, self.lives, self.level = [], 0, 3, 1
        self.game_over = self.paused = False
        self.cooldown = 0.0
        self.asteroids = spawn_wave(self.rng, self.level, self.ship)

    def toggle_pause(self):
        if not self.game_over:
            self.paused = not self.paused

    def shoot(self):
        if (self.game_over or self.paused or self.cooldown > 0
                or len(self.bullets) >= 6):
            return False
        s = self.ship
        c, sn = math.cos(s.angle), math.sin(s.angle)
        self.bullets.append(Bullet(s.x + c * s.r, s.y + sn * s.r,
                                   s.vx + c * 560, s.vy + sn * 560, 2.0))
        self.cooldown = 0.2
        return True

    def update(self, dt, turn=0, thrust=False):
        if self.game_over or self.paused:
            return
        self.ship.steer(dt, turn, thrust)
        self.cooldown = max(0.0, self.cooldown - dt)
        for a in self.asteroids:
            a.move(dt)
            a.angle += a.spin * dt
        for b in self.bullets:
            b.move(dt)
            b.ttl -= dt
        self.bullets = [b for b in self.bullets if b.ttl > 0]
        bullets_vs_rocks(self)
        ship_vs_rocks(self)
        if not self.asteroids and not self.game_over:
            self.level += 1
            self.asteroids = spawn_wave(self.rng, self.level, self.ship)
