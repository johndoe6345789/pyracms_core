from tetris_logic import Tetris
from tetris_shapes import COLS, ROWS, Piece


def game_with(kind="O"):
    g = Tetris(seed=1)
    g.piece = Piece(kind)
    return g


def test_line_clear_scores_and_counts():
    g = game_with("I")
    g.board[ROWS - 1] = ["X"] * COLS
    g.board[ROWS - 1][3:7] = [None] * 4  # gap where horizontal I lands
    g.hard_drop()
    assert g.lines == 1 and g.score >= 100
    assert all(c is None for c in g.board[ROWS - 1])


def test_tick_falls_and_locks():
    g = game_with("O")
    y = g.piece.y
    g.tick()
    assert g.piece.y == y + 1
    g.piece.y = ROWS - 2
    piece = g.piece
    g.tick()
    assert g.piece is not piece
    g.paused = True
    g.tick()


def test_lock_above_board_ends_game():
    g = game_with("O")
    g.piece.y = -3
    g.lock()
    assert g.game_over


def test_game_over_when_spawn_blocked():
    g = Tetris(seed=1)
    for y in range(3):
        g.board[y] = ["X"] * COLS
    g._spawn()
    assert g.game_over
    before = g.piece.y
    g.tick()
    assert g.piece.y == before


def test_ghost_and_level_speed():
    g = game_with("O")
    assert g.ghost_y() == ROWS - 2
    slow = g.fall_interval
    g.lines, g.level = 30, 4
    assert g.fall_interval < slow


def test_pause_blocks_input_and_seven_bag():
    g = Tetris(seed=2)
    g.toggle_pause()
    x = g.piece.x
    assert g.move(1) is False and g.piece.x == x
    g._bag = []
    assert len({g._draw() for _ in range(7)}) == 7
    g.game_over = True
    g.toggle_pause()
    assert g.paused
