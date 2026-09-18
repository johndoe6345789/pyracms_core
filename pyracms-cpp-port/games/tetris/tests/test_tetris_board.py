from tetris_board import clear_lines, fits, new_board
from tetris_shapes import COLS, ROWS, Piece


def test_all_pieces_have_four_cells_inside():
    for kind in "IOTSZJL":
        p = Piece(kind)
        assert len(set(p.cells())) == 4
        assert all(0 <= x < COLS for x, _ in p.cells())


def test_fits_walls_floor_and_occupied():
    b = new_board()
    assert fits(b, [(0, 0), (COLS - 1, ROWS - 1)])
    assert not fits(b, [(-1, 0)]) and not fits(b, [(0, ROWS)])
    b[5][5] = "X"
    assert not fits(b, [(5, 5)]) and fits(b, [(5, -1)])


def test_multi_line_clear_helper():
    b = new_board()
    for y in (ROWS - 1, ROWS - 2):
        b[y] = ["X"] * COLS
    b, n = clear_lines(b)
    assert n == 2 and len(b) == ROWS
    assert all(c is None for row in b for c in row)
