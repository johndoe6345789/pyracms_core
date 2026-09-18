"""Pure Tetris rules (no pyglet import)."""
from __future__ import annotations

import random

from tetris_board import clear_lines, new_board
from tetris_moves import MovesMixin
from tetris_shapes import LINE_SCORES, SHAPES, Piece


class Tetris(MovesMixin):
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.reset()

    def reset(self):
        self.board = new_board()
        self.score = self.lines = 0
        self.level = 1
        self.game_over = self.paused = False
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

    @property
    def fall_interval(self):
        return max(0.08, 0.8 - (self.level - 1) * 0.07)

    def tick(self):
        """Gravity step: like a soft drop without the bonus."""
        if not self._active():
            return
        if self._can_fall():
            self.piece.y += 1
        else:
            self.lock()

    def lock(self):
        for x, y in self.piece.cells():
            if y < 0:
                self.game_over = True
                return
            self.board[y][x] = self.piece.kind
        self.board, cleared = clear_lines(self.board)
        self.score += LINE_SCORES[cleared] * self.level
        self.lines += cleared
        self.level = 1 + self.lines // 10
        self._spawn()

    def toggle_pause(self):
        if not self.game_over:
            self.paused = not self.paused
