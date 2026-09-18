"""Tetris window (pyglet). Thin glue, excluded from coverage."""
import pyglet
from pyglet.window import key

from tetris_logic import Tetris
from tetris_shapes import COLS, ROWS
from tetris_view import CELL, SIDE, View


class TetrisWindow(pyglet.window.Window):
    def __init__(self):
        super().__init__(COLS * CELL + SIDE, ROWS * CELL, caption="Tetris")
        self.game = Tetris()
        self.view = View(self.height)
        self.acc = 0.0
        pyglet.clock.schedule_interval(self.update, 1 / 60)

    def update(self, dt):
        self.acc += dt
        if self.acc >= self.game.fall_interval:
            self.acc = 0.0
            self.game.tick()
        self.view.refresh(self.game)

    def on_key_press(self, symbol, modifiers):
        g = self.game
        actions = {key.LEFT: lambda: g.move(-1),
                   key.RIGHT: lambda: g.move(1), key.UP: g.rotate,
                   key.DOWN: g.soft_drop, key.SPACE: g.hard_drop,
                   key.P: g.toggle_pause}
        if symbol in actions:
            actions[symbol]()
        elif symbol == key.R and g.game_over:
            g.reset()
        self.view.refresh(g)

    def on_draw(self):
        self.clear()
        self.view.batch.draw()
