from tetris_logic import Tetris
from tetris_shapes import COLS, ROWS, Piece


def game_with(kind="O"):
    g = Tetris(seed=1)
    g.piece = Piece(kind)
    return g


def test_move_blocked_by_walls():
    g = game_with("O")
    for _ in range(20):
        g.move(-1)
    assert min(x for x, _ in g.piece.cells()) == 0
    assert g.move(-1) is False
    assert g.move(1) is True


def test_rotate_wall_kick_and_blocked():
    g = game_with("I")
    g.piece.rot = 1
    g.piece.x = COLS - 3  # vertical I hugging the right wall
    assert g.rotate()
    assert all(0 <= x < COLS for x, _ in g.piece.cells())
    g.paused = True
    assert g.rotate() is False


def test_rotate_fails_when_boxed_in():
    g = game_with("I")
    g.board = [["X"] * COLS for _ in range(ROWS)]
    g.piece = Piece("I", 3, 5)
    assert g.rotate() is False


def test_soft_drop_scores_then_locks():
    g = game_with("O")
    assert g.soft_drop() and g.score == 1
    g.piece.y = ROWS - 2
    before = g.piece
    assert g.soft_drop() is False and g.piece is not before
    g.paused = True
    assert g.soft_drop() is False


def test_hard_drop_locks_at_bottom_and_scores():
    g = game_with("O")
    g.hard_drop()
    assert g.board[ROWS - 1][4] == "O" and g.board[ROWS - 1][5] == "O"
    assert g.score > 0
    g.paused = True
    g.hard_drop()
