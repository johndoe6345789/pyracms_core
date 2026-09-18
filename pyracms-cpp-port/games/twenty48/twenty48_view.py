"""2048 widgets (pyglet). Thin glue, excluded from coverage."""
import pyglet

from twenty48_board import SIZE

CELL, GAP, TOP = 100, 10, 70
BOARD_PX = SIZE * CELL + (SIZE + 1) * GAP
BG, EMPTY = (187, 173, 160), (205, 193, 180)
COLORS = {2: (238, 228, 218), 4: (237, 224, 200), 8: (242, 177, 121),
          16: (245, 149, 99), 32: (246, 124, 95), 64: (246, 94, 59),
          128: (237, 207, 114), 256: (237, 204, 97), 512: (237, 200, 80),
          1024: (237, 197, 63), 2048: (237, 194, 46)}


def banner_text(g):
    if g.game_over:
        return "GAME OVER - press R"
    return "You made 2048! Keep going" if g.won else ""


class View:
    def __init__(self):
        self.batch = pyglet.graphics.Batch()
        bg = pyglet.graphics.Group(order=0)
        fg = pyglet.graphics.Group(order=1)
        self.frame = pyglet.shapes.Rectangle(
            0, 0, BOARD_PX, BOARD_PX, color=BG, batch=self.batch, group=bg)
        self.tiles, self.labels = {}, {}
        for r in range(SIZE):
            for c in range(SIZE):
                x = GAP + c * (CELL + GAP)
                y = GAP + (SIZE - 1 - r) * (CELL + GAP)
                self.tiles[(r, c)] = pyglet.shapes.Rectangle(
                    x, y, CELL, CELL, color=EMPTY, batch=self.batch,
                    group=bg)
                self.labels[(r, c)] = pyglet.text.Label(
                    "", x=x + CELL // 2, y=y + CELL // 2, font_size=26,
                    anchor_x="center", anchor_y="center",
                    color=(60, 55, 50, 255), batch=self.batch, group=fg)
        self.hud = pyglet.text.Label(
            "", x=GAP, y=BOARD_PX + 30, font_size=16, batch=self.batch,
            group=fg, color=(230, 230, 240, 255))
        self.banner = pyglet.text.Label(
            "", x=GAP, y=BOARD_PX + 8, font_size=12, batch=self.batch,
            group=fg, color=(255, 210, 110, 255))

    def refresh(self, g):
        for (r, c), tile in self.tiles.items():
            v = g.board[r][c]
            tile.color = COLORS.get(v, (60, 58, 50)) if v else EMPTY
            self.labels[(r, c)].text = str(v) if v else ""
        self.hud.text = f"Score {g.score}   Best {g.best}"
        self.banner.text = banner_text(g)
