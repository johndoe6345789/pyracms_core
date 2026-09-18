from twenty48_board import (DOWN, LEFT, RIGHT, UP, can_move, empty_cells,
                            move_board, slide_row)


def test_slide_merges_once_per_pair():
    assert slide_row([2, 2, 2, 2]) == ([4, 4, 0, 0], 8)
    assert slide_row([2, 2, 4, 0]) == ([4, 4, 0, 0], 4)
    assert slide_row([0, 2, 0, 2]) == ([4, 0, 0, 0], 4)
    assert slide_row([2, 4, 8, 16]) == ([2, 4, 8, 16], 0)


def test_move_all_directions():
    b = [[2, 0, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0]]
    left, pts, moved = move_board(b, LEFT)
    assert left[0] == [4, 0, 0, 0] and pts == 4 and moved
    right = move_board(b, RIGHT)[0]
    assert right[0] == [0, 0, 0, 4] and right[3] == [0, 0, 0, 2]
    up = move_board(b, UP)[0]
    assert up[0][0] == 4 and up[1][0] == 0
    down = move_board(b, DOWN)[0]
    assert down[3][0] == 4 and down[3][3] == 2


def test_unmoved_and_input_untouched():
    b = [[2, 4, 8, 16], [0] * 4, [0] * 4, [0] * 4]
    snapshot = [r[:] for r in b]
    assert move_board(b, LEFT)[2] is False
    assert b == snapshot


def test_empty_cells_and_can_move():
    full = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
    assert empty_cells(full) == [] and not can_move(full)
    full[0][1] = 2
    full[0][0] = 2
    assert can_move(full)
    assert empty_cells([[0, 1], [1, 1]]) == [(0, 0)]
