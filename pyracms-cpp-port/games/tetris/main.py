"""Tetris (pyglet). Left/Right move, Up rotate, Down soft drop, Space hard drop, P pause, R restart."""
import os
import sys

import pyglet
from pyglet.window import key

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tetris_logic import COLS, ROWS, SHAPES, Tetris  # noqa: E402

CELL = 30
SIDE = 180
COLORS = {"I": (80, 220, 230), "O": (240, 220, 80), "T": (180, 100, 220), "S": (100, 210, 110),
          "Z": (230, 90, 90), "J": (90, 120, 230), "L": (240, 160, 70)}


class TetrisWindow(pyglet.window.Window):
    def __init__(self):
        super().__init__(COLS * CELL + SIDE, ROWS * CELL, caption="Tetris")
        self.game = Tetris()
        self.batch = pyglet.graphics.Batch()
        self.bg = pyglet.graphics.Group(order=0)
        self.fg = pyglet.graphics.Group(order=1)
        self.cells = {}
        for y in range(ROWS):
            for x in range(COLS):
                self.cells[(x, y)] = pyglet.shapes.Rectangle(
                    x * CELL + 1, (ROWS - 1 - y) * CELL + 1, CELL - 2, CELL - 2,
                    color=(28, 30, 40), batch=self.batch, group=self.bg)
        self.preview = [pyglet.shapes.Rectangle(0, 0, CELL - 2, CELL - 2, batch=self.batch, group=self.fg)
                        for _ in range(4)]
        px = COLS * CELL + 16
        kw = dict(batch=self.batch, group=self.fg, x=px, color=(230, 230, 240, 255))
        self.lbl_score = pyglet.text.Label("", y=self.height - 40, font_size=14, **kw)
        self.lbl_lines = pyglet.text.Label("", y=self.height - 70, font_size=12, **kw)
        self.lbl_next = pyglet.text.Label("Next", y=self.height - 120, font_size=12, **kw)
        self.lbl_banner = pyglet.text.Label("", x=COLS * CELL // 2, y=self.height // 2, anchor_x="center",
                                            font_size=20, batch=self.batch, group=self.fg,
                                            color=(255, 255, 255, 255))
        self.acc = 0.0
        pyglet.clock.schedule_interval(self.update, 1 / 60)

    def update(self, dt):
        g = self.game
        self.acc += dt
        if self.acc >= g.fall_interval:
            self.acc = 0.0
            g.tick()
        self.refresh()

    def refresh(self):
        g = self.game
        for (x, y), r in self.cells.items():
            kind = g.board[y][x]
            r.color = COLORS[kind] if kind else (28, 30, 40)
        if not g.game_over:
            gy = g.ghost_y()
            for x, y in g.piece.cells(y=gy):
                if 0 <= y < ROWS and 0 <= x < COLS:
                    self.cells[(x, y)].color = (70, 72, 90)
            for x, y in g.piece.cells():
                if 0 <= y < ROWS and 0 <= x < COLS:
                    self.cells[(x, y)].color = COLORS[g.piece.kind]
        for r, (cx, cy) in zip(self.preview, SHAPES[g.next_kind][0]):
            r.x = COLS * CELL + 30 + cx * CELL
            r.y = self.height - 180 - cy * CELL
            r.color = COLORS[g.next_kind]
        self.lbl_score.text = f"Score {g.score}"
        self.lbl_lines.text = f"Lines {g.lines}  Lv {g.level}"
        self.lbl_banner.text = "GAME OVER - press R" if g.game_over else "PAUSED" if g.paused else ""

    def on_key_press(self, symbol, modifiers):
        g = self.game
        if symbol == key.LEFT:
            g.move(-1)
        elif symbol == key.RIGHT:
            g.move(1)
        elif symbol == key.UP:
            g.rotate()
        elif symbol == key.DOWN:
            g.soft_drop()
        elif symbol == key.SPACE:
            g.hard_drop()
        elif symbol == key.P:
            g.toggle_pause()
        elif symbol == key.R and g.game_over:
            g.reset()
        self.refresh()

    def on_draw(self):
        self.clear()
        self.batch.draw()


def main():
    TetrisWindow()
    pyglet.app.run()


if __name__ == "__main__":
    main()
