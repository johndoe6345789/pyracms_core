import pong_consts as C
from pong_logic import Pong


def test_ball_bounces_off_top_and_bottom():
    g = Pong(seed=1)
    g.bx, g.by, g.bvx, g.bvy = C.W / 2, C.H - 2, 0.0, 200.0
    g.update(0.05)
    assert g.bvy < 0
    g.by, g.bvy = 2, -200.0
    g.update(0.05)
    assert g.bvy > 0


def test_paddle_clamped_to_court():
    g = Pong(seed=1)
    for _ in range(200):
        g.move_paddle(0, 1, 0.05)
    assert g.left_y == C.H - C.PADDLE_H / 2
    for _ in range(200):
        g.move_paddle(0, -1, 0.05)
    assert g.left_y == C.PADDLE_H / 2
    g.move_paddle(1, 1, 0.05)
    assert g.right_y > C.H / 2


def test_left_paddle_returns_ball_faster():
    g = Pong(seed=1)
    g.left_y = 250
    g.bx, g.by, g.bvx, g.bvy = C.LEFT_X + 15, 250, -300.0, 0.0
    g.update(0.02)
    assert g.bvx > 0 and abs(g.bvx) > 300


def test_right_paddle_returns_ball():
    g = Pong(seed=1)
    g.right_y = 250
    g.bx, g.by, g.bvx, g.bvy = C.RIGHT_X - 15, 250, 300.0, 0.0
    g.update(0.02)
    assert g.bvx < 0


def test_pause_freezes_and_reset():
    g = Pong(seed=1)
    x = g.bx
    g.toggle_pause()
    g.update(0.1)
    assert g.bx == x
    g.toggle_pause()
    assert not g.paused


def test_ai_tracks_ball_both_sides():
    g = Pong(seed=1)
    g.by, g.right_y = 400, 100
    g.ai(0.1)
    assert g.right_y > 100
    g.by, g.left_y = 50, 300
    g.ai(0.1, side=0)
    assert g.left_y < 300
    y = g.right_y
    g.by = y + 2
    g.ai(0.1)
    assert g.right_y == y
