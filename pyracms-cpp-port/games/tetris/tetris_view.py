"""Tetris widgets (pyglet). Thin glue, excluded from coverage."""
import pyglet

from tetris_shapes import COLS, ROWS, SHAPES

CELL = 30
SIDE = 180
EMPTY, GHOST = (28, 30, 40), (70, 72, 90)
COLORS = {"I": (80, 220, 230), "O": (240, 220, 80), "T": (180, 100, 220),
          "S": (100, 210, 110), "Z": (230, 90, 90), "J": (90, 120, 230),
          "L": (240, 160, 70)}


def banner_text(g):
    if g.game_over:
        return "GAME OVER - press R"
    return "PAUSED" if g.paused else ""


class View:
    def __init__(self, height):
        self.height = height
        self.batch = pyglet.graphics.Batch()
        bg = pyglet.graphics.Group(order=0)
        fg = pyglet.graphics.Group(order=1)
        rect = pyglet.shapes.Rectangle
        self.cells = {
            (x, y): rect(x * CELL + 1, (ROWS - 1 - y) * CELL + 1,
                         CELL - 2, CELL - 2, color=EMPTY,
                         batch=self.batch, group=bg)
            for y in range(ROWS) for x in range(COLS)}
        self.preview = [rect(0, 0, CELL - 2, CELL - 2, batch=self.batch,
                             group=fg) for _ in range(4)]
        kw = dict(batch=self.batch, group=fg, x=COLS * CELL + 16,
                  color=(230, 230, 240, 255))
        label = pyglet.text.Label
        self.score = label("", y=height - 40, font_size=14, **kw)
        self.lines = label("", y=height - 70, font_size=12, **kw)
        self.next = label("Next", y=height - 120, font_size=12, **kw)
        self.banner = label("", x=COLS * CELL // 2, y=height // 2,
                            anchor_x="center", font_size=20,
                            batch=self.batch, group=fg,
                            color=(255, 255, 255, 255))

    def _paint(self, cells, color):
        for x, y in cells:
            if 0 <= y < ROWS and 0 <= x < COLS:
                self.cells[(x, y)].color = color

    def refresh(self, g):
        for (x, y), r in self.cells.items():
            kind = g.board[y][x]
            r.color = COLORS[kind] if kind else EMPTY
        if not g.game_over:
            self._paint(g.piece.cells(y=g.ghost_y()), GHOST)
            self._paint(g.piece.cells(), COLORS[g.piece.kind])
        for r, (cx, cy) in zip(self.preview, SHAPES[g.next_kind][0]):
            r.x = COLS * CELL + 30 + cx * CELL
            r.y = self.height - 180 - cy * CELL
            r.color = COLORS[g.next_kind]
        self.score.text = f"Score {g.score}"
        self.lines.text = f"Lines {g.lines}  Lv {g.level}"
        self.banner.text = banner_text(g)
