from twenty48_board import LEFT, RIGHT
from twenty48_logic import Game2048


def tiles(g):
    return sum(1 for row in g.board for v in row if v)


def test_new_game_has_two_tiles():
    assert tiles(Game2048(seed=1)) == 2


def test_move_scores_spawns_and_tracks_best():
    g = Game2048(seed=1)
    g.board = [[2, 2, 0, 0], [0] * 4, [0] * 4, [0] * 4]
    assert g.move(LEFT)
    assert g.score == 4 and g.best == 4 and tiles(g) == 2
    g.reset()
    assert g.score == 0 and g.best == 4


def test_noop_move_does_nothing():
    g = Game2048(seed=1)
    g.board = [[2, 0, 0, 0], [0] * 4, [0] * 4, [0] * 4]
    assert g.move(LEFT) is False and tiles(g) == 1


def test_win_and_game_over():
    g = Game2048(seed=1)
    g.board = [[1024, 1024, 0, 0], [0] * 4, [0] * 4, [0] * 4]
    g.move(LEFT)
    assert g.won and not g.game_over
    g.board = [[8, 16, 8, 16], [16, 8, 16, 8], [8, 16, 8, 16],
               [8, 16, 8, 0]]
    g.move(RIGHT)
    assert g.game_over
    assert g.move(LEFT) is False


def test_spawn_on_full_board_is_none():
    g = Game2048(seed=1)
    g.board = [[2] * 4 for _ in range(4)]
    assert g.spawn() is None
