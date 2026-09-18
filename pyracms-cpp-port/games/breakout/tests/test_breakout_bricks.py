import breakout_consts as C
from breakout_bricks import brick_points, brick_rect, hit_brick, new_bricks


def test_grid_size_and_rects_fit_screen():
    bricks = new_bricks()
    assert len(bricks) == C.COLS * C.ROWS
    x, y, w, h = brick_rect(C.COLS - 1, C.ROWS - 1)
    assert x + w <= C.W and y + h < C.H


def test_points_favor_top_rows():
    assert brick_points(0) > brick_points(C.ROWS - 1)


def test_hit_brick_only_when_touching():
    bricks = {(2, 1)}
    x, y, w, h = brick_rect(2, 1)
    assert hit_brick(bricks, x + w / 2, y + h / 2, 5) == (2, 1)
    assert hit_brick(bricks, x + w / 2, y + h + 20, 5) is None
