"""2048 window (pyglet). Thin glue, excluded from coverage."""
import pyglet
from pyglet.window import key

import twenty48_board as B
from twenty48_logic import Game2048
from twenty48_view import BOARD_PX, TOP, View

KEYS = {key.LEFT: B.LEFT, key.A: B.LEFT, key.RIGHT: B.RIGHT,
        key.D: B.RIGHT, key.UP: B.UP, key.W: B.UP, key.DOWN: B.DOWN,
        key.S: B.DOWN}


class Window2048(pyglet.window.Window):
    def __init__(self):
        super().__init__(BOARD_PX, BOARD_PX + TOP, caption="2048")
        self.game = Game2048()
        self.view = View()
        self.view.refresh(self.game)

    def on_key_press(self, symbol, modifiers):
        if symbol in KEYS:
            self.game.move(KEYS[symbol])
        elif symbol == key.R:
            self.game.reset()
        else:
            return pyglet.event.EVENT_UNHANDLED
        self.view.refresh(self.game)

    def on_draw(self):
        self.clear()
        self.view.batch.draw()
