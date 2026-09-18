import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from tetris_logic import COLS, ROWS, Piece, Tetris  # noqa: E402


def game_with(kind="O"):
    g = Tetris(seed=1)
    g.piece = Piece(kind)
    return g


def test_all_pieces_fit_at_spawn_and_cells_are_four():
    for kind in "IOTSZJL":
        p = Piece(kind)
        assert len(set(p.cells())) == 4
        assert all(0 <= x < COLS for x, _ in p.cells())


def test_move_blocked_by_walls():
    g = game_with("O")
    for _ in range(20):
        g.move(-1)
    assert min(x for x, _ in g.piece.cells()) == 0
    assert g.move(-1) is False


def test_rotate_wall_kick():
    g = game_with("I")
    g.piece.rot = 1
    g.piece.x = COLS - 3  # vertical I hugging right wall
    assert g.rotate()
    assert all(0 <= x < COLS for x, _ in g.piece.cells())


def test_hard_drop_locks_at_bottom_and_scores():
    g = game_with("O")
    g.hard_drop()
    assert g.board[ROWS - 1][4] == "O" and g.board[ROWS - 1][5] == "O"
    assert g.score > 0


def test_line_clear_scores_and_counts():
    g = game_with("I")
    g.board[ROWS - 1] = ["X"] * COLS
    g.board[ROWS - 1][3:7] = [None] * 4  # gap exactly where horizontal I lands
    g.hard_drop()
    assert g.lines == 1 and g.score >= 100
    assert all(c is None for c in g.board[ROWS - 1])


def test_multi_line_clear_helper():
    g = Tetris(seed=1)
    for y in (ROWS - 1, ROWS - 2):
        g.board[y] = ["X"] * COLS
    assert g.clear_lines() == 2
    assert all(c is None for row in g.board for c in row)


def test_game_over_when_spawn_blocked():
    g = Tetris(seed=1)
    for y in range(3):
        g.board[y] = ["X"] * COLS
    g._spawn()
    assert g.game_over
    before = g.piece.y
    g.tick()
    assert g.piece.y == before


def test_level_speeds_up_gravity():
    g = Tetris(seed=1)
    slow = g.fall_interval
    g.lines, g.level = 30, 4
    assert g.fall_interval < slow


def test_pause_blocks_input_and_seven_bag():
    g = Tetris(seed=2)
    g.toggle_pause()
    x = g.piece.x
    assert g.move(1) is False and g.piece.x == x
    g._bag = []
    seen = {g._draw() for _ in range(7)}
    assert len(seen) == 7
