import breakout_consts as C
from breakout_logic import Breakout


def launched(seed=1):
    g = Breakout(seed=seed)
    assert g.launch()
    return g


def test_walls_and_ceiling_reflect():
    g = launched()
    g.bx, g.by, g.bvx, g.bvy = 2, 200, -100.0, 0.0
    g.update(0.01)
    assert g.bvx > 0
    g.bx, g.by, g.bvx, g.bvy = C.W - 2, 200, 100.0, 0.0
    g.update(0.01)
    assert g.bvx < 0
    g.bx, g.by, g.bvx, g.bvy = 300, 2, 0.0, -100.0
    g.update(0.01)
    assert g.bvy > 0


def test_paddle_bounce_angle_follows_hit_point():
    g = launched()
    g.bricks = {(0, 0)}
    g.bx, g.by = g.paddle_x + 40, C.PADDLE_Y - 3
    g.bvx, g.bvy = 0.0, 300.0
    g.update(0.001)
    assert g.bvy < 0 and g.bvx > 0


def test_brick_hit_scores_and_reflects():
    g = launched()
    g.bx = C.BRICK_W / 2
    g.by = C.TOP + C.BRICK_H + C.BALL_R - 2
    g.bvx, g.bvy = 0.0, -100.0
    g.update(0.001)
    assert (0, 0) not in g.bricks and g.bvy > 0
    assert g.score == C.ROWS * 10


def test_clearing_bricks_levels_up():
    g = launched()
    g.bricks = {(0, 0)}
    g.bx = C.BRICK_W / 2
    g.by = C.TOP + C.BRICK_H + C.BALL_R - 2
    g.bvx, g.bvy = 0.0, -100.0
    g.update(0.001)
    assert g.level == 2 and g.stuck and len(g.bricks) == C.COLS * C.ROWS


def test_losing_ball_costs_life_then_game_over():
    g = launched()
    g.bx, g.by, g.bvx, g.bvy = 10, C.H + 20, 0.0, 100.0
    g.update(0.01)
    assert g.lives == 2 and g.stuck and not g.game_over
    g.lives = 1
    g.launch()
    g.bx, g.by, g.bvx, g.bvy = 10, C.H + 20, 0.0, 100.0
    g.update(0.01)
    assert g.game_over
    g.reset()
    assert g.lives == C.LIVES and g.score == 0 and not g.game_over


def test_pause_freezes_ball():
    g = launched()
    g.toggle_pause()
    y = g.by
    g.update(0.1)
    assert g.by == y
    g.game_over = True
    g.toggle_pause()
    assert g.paused
