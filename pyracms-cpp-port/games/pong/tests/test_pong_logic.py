import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import pong_logic as L  # noqa: E402


def test_ball_bounces_off_top_and_bottom():
    g = L.Pong(seed=1)
    g.bx, g.by, g.bvx, g.bvy = L.W / 2, L.H - 2, 0.0, 200.0
    g.update(0.05)
    assert g.bvy < 0
    g.by, g.bvy = 2, -200.0
    g.update(0.05)
    assert g.bvy > 0


def test_paddle_clamped_to_court():
    g = L.Pong(seed=1)
    for _ in range(200):
        g.move_paddle(0, 1, 0.05)
    assert g.left_y == L.H - L.PADDLE_H / 2
    for _ in range(200):
        g.move_paddle(0, -1, 0.05)
    assert g.left_y == L.PADDLE_H / 2


def test_left_paddle_returns_ball_faster():
    g = L.Pong(seed=1)
    g.left_y = 250
    g.bx, g.by, g.bvx, g.bvy = L.LEFT_X + 15, 250, -300.0, 0.0
    g.update(0.02)
    assert g.bvx > 0 and abs(g.bvx) > 300


def test_hit_position_controls_angle():
    g = L.Pong(seed=1)
    g.left_y = 250
    g.bx, g.by, g.bvx, g.bvy = L.LEFT_X + 15, 250 + 35, -300.0, 0.0
    g.update(0.001)
    assert g.bvy > 0
    g2 = L.Pong(seed=1)
    g2.left_y = 250
    g2.bx, g2.by, g2.bvx, g2.bvy = L.LEFT_X + 15, 250 - 35, -300.0, 0.0
    g2.update(0.001)
    assert g2.bvy < 0


def test_scoring_and_serve():
    g = L.Pong(seed=1)
    g.left_y = 50  # far from the ball
    g.bx, g.by, g.bvx, g.bvy = 10, 400, -300.0, 0.0
    for _ in range(20):
        g.update(0.02)
        if g.score != [0, 0]:
            break
    assert g.score == [0, 1]
    assert g.bx == L.W / 2  # re-served


def test_win_condition_stops_play():
    g = L.Pong(seed=1)
    g.score = [L.WIN_SCORE - 1, 0]
    g.left_y = 50
    g.right_y = 50
    g.bx, g.by, g.bvx, g.bvy = L.W - 5, 400, 300.0, 0.0
    for _ in range(20):
        g.update(0.02)
    assert g.winner == 0 and g.game_over
    x = g.bx
    g.update(0.5)
    assert g.bx == x
    g.reset()
    assert g.winner is None and g.score == [0, 0]


def test_pause_freezes():
    g = L.Pong(seed=1)
    x = g.bx
    g.toggle_pause()
    g.update(0.1)
    assert g.bx == x


def test_ai_tracks_ball():
    g = L.Pong(seed=1)
    g.by = 400
    g.right_y = 100
    g.ai(0.1)
    assert g.right_y > 100
