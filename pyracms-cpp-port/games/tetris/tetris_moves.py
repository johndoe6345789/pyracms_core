"""Piece movement for Tetris (mixin, no pyglet import)."""
from __future__ import annotations

from tetris_board import fits


class MovesMixin:
    def _fits(self, cells):
        return fits(self.board, cells)

    def _active(self):
        return not (self.game_over or self.paused)

    def _can_fall(self):
        return self._fits(self.piece.cells(y=self.piece.y + 1))

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
        """Move down one; lock if blocked. Returns True if it moved."""
        if not self._active():
            return False
        if self._can_fall():
            self.piece.y += 1
            self.score += 1
            return True
        self.lock()
        return False

    def hard_drop(self):
        if not self._active():
            return
        while self._can_fall():
            self.piece.y += 1
            self.score += 2
        self.lock()

    def ghost_y(self):
        y = self.piece.y
        while self._fits(self.piece.cells(y=y + 1)):
            y += 1
        return y
