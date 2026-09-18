"""Pure 2048 rules (no pyglet import)."""
from __future__ import annotations

import random

from twenty48_board import SIZE, can_move, empty_cells, move_board

WIN_TILE = 2048


class Game2048:
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.best = 0
        self.reset()

    def reset(self):
        self.board = [[0] * SIZE for _ in range(SIZE)]
        self.score = 0
        self.won = self.game_over = False
        self.spawn()
        self.spawn()

    def spawn(self):
        cells = empty_cells(self.board)
        if not cells:
            return None
        r, c = self.rng.choice(cells)
        self.board[r][c] = 4 if self.rng.random() < 0.1 else 2
        return (r, c)

    def move(self, direction):
        """Apply a move; returns True if the board changed."""
        if self.game_over:
            return False
        board, points, moved = move_board(self.board, direction)
        if not moved:
            return False
        self.board = board
        self.score += points
        self.best = max(self.best, self.score)
        self.won = self.won or any(WIN_TILE in row for row in board)
        self.spawn()
        self.game_over = not can_move(self.board)
        return True
