import random

import pong_consts as C
from pong_ball import bounce_velocity, paddle_hit, serve_velocity
from pong_logic import Pong


def test_hit_position_controls_angle():
    up = bounce_velocity(285, 250, -300.0, 0.0, True)
    down = bounce_velocity(215, 250, -300.0, 0.0, True)
    assert up[1] > 0 > down[1] and up[0] > 0
    assert bounce_velocity(250, 250, 300.0, 0.0, False)[0] < 0


def test_paddle_hit_and_serve():
    assert paddle_hit(C.LEFT_X, 250, C.LEFT_X, 250)
    assert not paddle_hit(400, 250, C.LEFT_X, 250)
    vx, _ = serve_velocity(random.Random(1), -1)
    assert vx < 0


def test_scoring_and_serve():
    g = Pong(seed=1)
    g.left_y = 50  # far from the ball
    g.bx, g.by, g.bvx, g.bvy = 10, 400, -300.0, 0.0
    for _ in range(20):
        g.update(0.02)
        if g.score != [0, 0]:
            break
    assert g.score == [0, 1]
    assert g.bx == C.W / 2  # re-served


def test_left_scores_when_ball_exits_right():
    g = Pong(seed=1)
    g.right_y = 50
    g.bx, g.by, g.bvx, g.bvy = C.W - 5, 400, 300.0, 0.0
    for _ in range(20):
        g.update(0.02)
    assert g.score == [1, 0]


def test_win_condition_stops_play():
    g = Pong(seed=1)
    g.score = [C.WIN_SCORE - 1, 0]
    g.left_y = g.right_y = 50
    g.bx, g.by, g.bvx, g.bvy = C.W - 5, 400, 300.0, 0.0
    for _ in range(20):
        g.update(0.02)
    assert g.winner == 0 and g.game_over
    x = g.bx
    g.update(0.5)
    g.toggle_pause()
    assert g.bx == x and not g.paused
    g.reset()
    assert g.winner is None and g.score == [0, 0]
