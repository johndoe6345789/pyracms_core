"""Pure Pong logic (no pyglet import). Origin bottom-left, y up (matches pyglet)."""
from __future__ import annotations

import math
import random

W, H = 800, 500
PADDLE_W, PADDLE_H = 14, 90
BALL_R = 8
PADDLE_SPEED = 420.0
BALL_START = 320.0
BALL_MAX = 720.0
WIN_SCORE = 7
LEFT_X = 30.0
RIGHT_X = W - 30.0


class Pong:
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.reset()

    def reset(self):
        self.left_y = self.right_y = H / 2
        self.score = [0, 0]
        self.winner = None
        self.paused = False
        self.serve(self.rng.choice((-1, 1)))

    def serve(self, direction=1):
        self.bx, self.by = W / 2, H / 2
        a = self.rng.uniform(-0.5, 0.5)
        self.bvx = math.cos(a) * BALL_START * direction
        self.bvy = math.sin(a) * BALL_START

    @property
    def game_over(self):
        return self.winner is not None

    def toggle_pause(self):
        if not self.game_over:
            self.paused = not self.paused

    def move_paddle(self, side, direction, dt):
        """side 0=left,1=right; direction -1 down, +1 up."""
        lim = PADDLE_H / 2
        v = max(lim, min(H - lim, (self.left_y if side == 0 else self.right_y) + direction * PADDLE_SPEED * dt))
        if side == 0:
            self.left_y = v
        else:
            self.right_y = v

    def ai(self, dt, side=1, skill=0.85):
        cur = self.right_y if side == 1 else self.left_y
        diff = self.by - cur
        if abs(diff) > 10:
            self.move_paddle(side, (1 if diff > 0 else -1) * skill, dt)

    def _paddle_hit(self, px, py):
        return (abs(self.bx - px) <= PADDLE_W / 2 + BALL_R and abs(self.by - py) <= PADDLE_H / 2 + BALL_R)

    def _bounce(self, py, going_right):
        """Angle depends on where the ball hit the paddle; speed grows a bit."""
        rel = max(-1.0, min(1.0, (self.by - py) / (PADDLE_H / 2)))
        speed = min(math.hypot(self.bvx, self.bvy) * 1.06, BALL_MAX)
        ang = rel * math.radians(55)
        self.bvx = math.cos(ang) * speed * (1 if going_right else -1)
        self.bvy = math.sin(ang) * speed

    def update(self, dt):
        if self.game_over or self.paused:
            return
        self.bx += self.bvx * dt
        self.by += self.bvy * dt
        if self.by < BALL_R:
            self.by, self.bvy = BALL_R, abs(self.bvy)
        elif self.by > H - BALL_R:
            self.by, self.bvy = H - BALL_R, -abs(self.bvy)
        if self.bvx < 0 and self._paddle_hit(LEFT_X, self.left_y):
            self.bx = LEFT_X + PADDLE_W / 2 + BALL_R
            self._bounce(self.left_y, True)
        elif self.bvx > 0 and self._paddle_hit(RIGHT_X, self.right_y):
            self.bx = RIGHT_X - PADDLE_W / 2 - BALL_R
            self._bounce(self.right_y, False)
        if self.bx < -BALL_R:
            self._point(1)
        elif self.bx > W + BALL_R:
            self._point(0)

    def _point(self, who):
        self.score[who] += 1
        if self.score[who] >= WIN_SCORE:
            self.winner = who
        else:
            self.serve(-1 if who == 0 else 1)  # serve toward the player who lost the point
