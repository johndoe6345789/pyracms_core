"""Pure Pong rules (no pyglet import)."""
from __future__ import annotations

import random

from pong_ball import (bounce_velocity, paddle_hit, serve_velocity,
                       wall_bounce)
from pong_consts import (BALL_R, H, LEFT_X, PADDLE_H, PADDLE_SPEED,
                         PADDLE_W, RIGHT_X, W, WIN_SCORE)


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
        self.bvx, self.bvy = serve_velocity(self.rng, direction)

    game_over = property(lambda self: self.winner is not None)

    def toggle_pause(self):
        if not self.game_over:
            self.paused = not self.paused

    def move_paddle(self, side, direction, dt):
        """side 0=left,1=right; direction -1 down, +1 up."""
        lim = PADDLE_H / 2
        cur = self.left_y if side == 0 else self.right_y
        v = max(lim, min(H - lim, cur + direction * PADDLE_SPEED * dt))
        if side == 0:
            self.left_y = v
        else:
            self.right_y = v

    def ai(self, dt, side=1, skill=0.85):
        diff = self.by - (self.right_y if side == 1 else self.left_y)
        if abs(diff) > 10:
            self.move_paddle(side, (1 if diff > 0 else -1) * skill, dt)

    def _bounce(self, py, going_right):
        self.bvx, self.bvy = bounce_velocity(self.by, py, self.bvx,
                                             self.bvy, going_right)

    def _walls_and_paddles(self):
        self.by, self.bvy = wall_bounce(self.by, self.bvy)
        if self.bvx < 0 and paddle_hit(self.bx, self.by, LEFT_X,
                                       self.left_y):
            self.bx = LEFT_X + PADDLE_W / 2 + BALL_R
            self._bounce(self.left_y, True)
        elif self.bvx > 0 and paddle_hit(self.bx, self.by, RIGHT_X,
                                         self.right_y):
            self.bx = RIGHT_X - PADDLE_W / 2 - BALL_R
            self._bounce(self.right_y, False)

    def update(self, dt):
        if self.game_over or self.paused:
            return
        self.bx += self.bvx * dt
        self.by += self.bvy * dt
        self._walls_and_paddles()
        if self.bx < -BALL_R:
            self._point(1)
        elif self.bx > W + BALL_R:
            self._point(0)

    def _point(self, who):
        self.score[who] += 1
        if self.score[who] >= WIN_SCORE:
            self.winner = who
        else:  # serve toward the player who lost the point
            self.serve(-1 if who == 0 else 1)
