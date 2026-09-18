"""Board helpers for Tetris (no pyglet import)."""
from __future__ import annotations

from tetris_shapes import COLS, ROWS


def new_board():
    return [[None] * COLS for _ in range(ROWS)]


def fits(board, cells):
    """True if every cell is inside the walls/floor and unoccupied."""
    return all(0 <= x < COLS and y < ROWS
               and (y < 0 or board[y][x] is None) for x, y in cells)


def clear_lines(board):
    """Returns (new_board, cleared_count)."""
    keep = [row for row in board if any(c is None for c in row)]
    cleared = ROWS - len(keep)
    return [[None] * COLS for _ in range(cleared)] + keep, cleared
