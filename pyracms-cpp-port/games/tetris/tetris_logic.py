"""Pure Tetris logic (no pyglet import)."""
from __future__ import annotations

import random

COLS, ROWS = 10, 20
# Each piece: list of rotation states, each a list of (x, y) cells. y grows downward.
SHAPES = {
    "I": [[(0, 1), (1, 1), (2, 1), (3, 1)], [(2, 0), (2, 1), (2, 2), (2, 3)]],
    "O": [[(1, 0), (2, 0), (1, 1), (2, 1)]],
    "T": [[(1, 0), (0, 1), (1, 1), (2, 1)], [(1, 0), (1, 1), (2, 1), (1, 2)],
          [(0, 1), (1, 1), (2, 1), (1, 2)], [(1, 0), (0, 1), (1, 1), (1, 2)]],
    "S": [[(1, 0), (2, 0), (0, 1), (1, 1)], [(1, 0), (1, 1), (2, 1), (2, 2)]],
    "Z": [[(0, 0), (1, 0), (1, 1), (2, 1)], [(2, 0), (1, 1), (2, 1), (1, 2)]],
    "J": [[(0, 0), (0, 1), (1, 1), (2, 1)], [(1, 0), (2, 0), (1, 1), (1, 2)],
          [(0, 1), (1, 1), (2, 1), (2, 2)], [(1, 0), (1, 1), (0, 2), (1, 2)]],
    "L": [[(2, 0), (0, 1), (1, 1), (2, 1)], [(1, 0), (1, 1), (1, 2), (2, 2)],
          [(0, 1), (1, 1), (2, 1), (0, 2)], [(0, 0), (1, 0), (1, 1), (1, 2)]],
}
LINE_SCORES = {0: 0, 1: 100, 2: 300, 3: 500, 4: 800}


class Piece:
    def __init__(self, kind: str, x: int = 3, y: int = 0, rot: int = 0):
        self.kind, self.x, self.y, self.rot = kind, x, y, rot

    def cells(self, x=None, y=None, rot=None):
        x = self.x if x is None else x
        y = self.y if y is None else y
        rot = self.rot if rot is None else rot
        states = SHAPES[self.kind]
        return [(x + cx, y + cy) for cx, cy in states[rot % len(states)]]


class Tetris:
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.reset()

    def reset(self):
        self.board = [[None] * COLS for _ in range(ROWS)]
        self.score = 0
        self.lines = 0
        self.level = 1
        self.game_over = False
        self.paused = False
        self._bag = []
        self.next_kind = self._draw()
        self.piece = None
        self._spawn()

    def _draw(self):
        if not self._bag:
            self._bag = list(SHAPES)
            self.rng.shuffle(self._bag)
        return self._bag.pop()

    def _spawn(self):
        self.piece = Piece(self.next_kind)
        self.next_kind = self._draw()
        if not self._fits(self.piece.cells()):
            self.game_over = True

    def _fits(self, cells):
        return all(0 <= x < COLS and y < ROWS and (y < 0 or self.board[y][x] is None) for x, y in cells)

    @property
    def fall_interval(self):
        return max(0.08, 0.8 - (self.level - 1) * 0.07)

    def _active(self):
        return not (self.game_over or self.paused)

    def move(self, dx):
        if self._active() and self._fits(self.piece.cells(x=self.piece.x + dx)):
            self.piece.x += dx
            return True
        return False

    def rotate(self):
        if not self._active():
            return False
        p = self.piece
        for kick in (0, -1, 1, -2, 2):  # simple wall kicks
            if self._fits(p.cells(x=p.x + kick, rot=p.rot + 1)):
                p.x += kick
                p.rot += 1
                return True
        return False

    def soft_drop(self):
        """Move down one; lock if blocked. Returns True if the piece moved."""
        if not self._active():
            return False
        if self._fits(self.piece.cells(y=self.piece.y + 1)):
            self.piece.y += 1
            self.score += 1
            return True
        self.lock()
        return False

    def hard_drop(self):
        if not self._active():
            return
        while self._fits(self.piece.cells(y=self.piece.y + 1)):
            self.piece.y += 1
            self.score += 2
        self.lock()

    def tick(self):
        """Gravity step: like soft drop without the bonus."""
        if not self._active():
            return
        if self._fits(self.piece.cells(y=self.piece.y + 1)):
            self.piece.y += 1
        else:
            self.lock()

    def lock(self):
        for x, y in self.piece.cells():
            if y < 0:
                self.game_over = True
                return
            self.board[y][x] = self.piece.kind
        cleared = self.clear_lines()
        self.score += LINE_SCORES[cleared] * self.level
        self.lines += cleared
        self.level = 1 + self.lines // 10
        self._spawn()

    def clear_lines(self):
        keep = [row for row in self.board if any(c is None for c in row)]
        cleared = ROWS - len(keep)
        self.board = [[None] * COLS for _ in range(cleared)] + keep
        return cleared

    def ghost_y(self):
        y = self.piece.y
        while self._fits(self.piece.cells(y=y + 1)):
            y += 1
        return y

    def toggle_pause(self):
        if not self.game_over:
            self.paused = not self.paused
