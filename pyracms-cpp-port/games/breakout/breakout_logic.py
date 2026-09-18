"""Pure Breakout rules (no pygame import)."""
from __future__ import annotations

import math
import random

from breakout_bricks import brick_points, hit_brick, new_bricks
from breakout_consts import (BALL_MAX, BALL_R, BALL_START, H, LIVES,
                             PADDLE_H, PADDLE_SPEED, PADDLE_W, PADDLE_Y, W)
from breakout_physics import paddle_bounce, wall_reflect


class Breakout:
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.reset()

    def reset(self):
        self.score, self.lives, self.level = 0, LIVES, 1
        self.game_over = self.paused = False
        self.bricks, self.paddle_x = new_bricks(), W / 2
        self.stick()

    def stick(self):  # park the ball on the paddle until launched
        self.stuck = True
        self.bx, self.by = self.paddle_x, PADDLE_Y - BALL_R
        self.bvx = self.bvy = 0.0

    def launch(self):
        if not self.stuck or self.game_over or self.paused:
            return False
        a = math.radians(self.rng.uniform(-30, 30))
        speed = min(BALL_START + 20 * (self.level - 1), BALL_MAX)
        self.bvx, self.bvy = math.sin(a) * speed, -math.cos(a) * speed
        self.stuck = False
        return True

    def toggle_pause(self):
        if not self.game_over:
            self.paused = not self.paused

    def move_paddle(self, direction, dt):
        half = PADDLE_W / 2
        x = self.paddle_x + direction * PADDLE_SPEED * dt
        self.paddle_x = max(half, min(W - half, x))
        if self.stuck:
            self.bx = self.paddle_x

    def _walls(self):
        self.bx, self.by, self.bvx, self.bvy = wall_reflect(
            self.bx, self.by, self.bvx, self.bvy)

    def _bricks(self):
        cell = hit_brick(self.bricks, self.bx, self.by, BALL_R)
        if cell:
            self.bricks.discard(cell)
            self.score += brick_points(cell[1])
            self.bvy = -self.bvy
        if not self.bricks:
            self.level += 1
            self.bricks = new_bricks()
            self.stick()

    def update(self, dt):
        if self.game_over or self.paused or self.stuck:
            return
        self.bx += self.bvx * dt
        self.by += self.bvy * dt
        self._walls()
        on_paddle = abs(self.bx - self.paddle_x) <= PADDLE_W / 2 + BALL_R
        if (self.bvy > 0 and PADDLE_Y <= self.by + BALL_R
                <= PADDLE_Y + PADDLE_H and on_paddle):
            self.bvx, self.bvy = paddle_bounce(
                self.bx, self.paddle_x, self.bvx, self.bvy)
            self.by = PADDLE_Y - BALL_R
        self._bricks()
        if self.by > H + BALL_R:
            self.lives -= 1
            self.game_over = self.lives <= 0
            self.stick()
