import breakout_consts as C
from breakout_logic import Breakout


def launched(seed=1):
    g = Breakout(seed=seed)
    assert g.launch()
    return g


def test_ball_sticks_to_paddle_until_launch():
    g = Breakout(seed=1)
    g.move_paddle(1, 0.1)
    assert g.stuck and g.bx == g.paddle_x
    g.update(0.1)
    assert g.by == C.PADDLE_Y - C.BALL_R
    assert g.launch() and g.bvy < 0 and not g.launch()


def test_launch_blocked_when_paused():
    g = Breakout(seed=1)
    g.toggle_pause()
    assert g.launch() is False


def test_paddle_clamped():
    g = Breakout(seed=1)
    for _ in range(100):
        g.move_paddle(1, 0.05)
    assert g.paddle_x == C.W - C.PADDLE_W / 2
    for _ in range(100):
        g.move_paddle(-1, 0.05)
    assert g.paddle_x == C.PADDLE_W / 2
