"""Pure 2048 board operations (no pyglet import)."""
from __future__ import annotations

SIZE = 4
LEFT, RIGHT, UP, DOWN = "left", "right", "up", "down"


def slide_row(row):
    """Slide one row to the left. Returns (new_row, points)."""
    tiles = [v for v in row if v]
    out, points, i = [], 0, 0
    while i < len(tiles):
        if i + 1 < len(tiles) and tiles[i] == tiles[i + 1]:
            out.append(tiles[i] * 2)
            points += tiles[i] * 2
            i += 2
        else:
            out.append(tiles[i])
            i += 1
    return out + [0] * (len(row) - len(out)), points


def _transpose(board):
    return [list(col) for col in zip(*board)]


def move_board(board, direction):
    """Returns (new_board, points, moved)."""
    b = _transpose(board) if direction in (UP, DOWN) else [r[:] for r in board]
    flip = direction in (RIGHT, DOWN)
    points, rows = 0, []
    for row in b:
        new, pts = slide_row(row[::-1] if flip else row)
        rows.append(new[::-1] if flip else new)
        points += pts
    if direction in (UP, DOWN):
        rows = _transpose(rows)
    return rows, points, rows != board


def empty_cells(board):
    return [(r, c) for r, row in enumerate(board)
            for c, v in enumerate(row) if not v]


def can_move(board):
    return any(move_board(board, d)[2] for d in (LEFT, RIGHT, UP, DOWN))
