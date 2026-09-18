"""Pong window (pyglet). Thin glue, excluded from coverage."""
import pyglet
from pyglet.window import key

import pong_consts as C
from pong_logic import Pong
from pong_view import View


class PongWindow(pyglet.window.Window):
    def __init__(self, two_player=False):
        super().__init__(C.W, C.H, caption="Pong")
        self.two_player = two_player
        self.game = Pong()
        self.keys = key.KeyStateHandler()
        self.push_handlers(self.keys)
        self.view = View()
        pyglet.clock.schedule_interval(self.update, 1 / 120)

    def _axis(self, up, down):
        return int(bool(self.keys[up])) - int(bool(self.keys[down]))

    def update(self, dt):
        g = self.game
        dt = min(dt, 0.05)
        if not (g.paused or g.game_over):
            g.move_paddle(0, self._axis(key.W, key.S), dt)
            if self.two_player:
                g.move_paddle(1, self._axis(key.UP, key.DOWN), dt)
            else:
                g.ai(dt)
        g.update(dt)
        self.view.refresh(g)

    def on_key_press(self, symbol, modifiers):
        if symbol == key.P:
            self.game.toggle_pause()
        elif symbol == key.R:
            self.game.reset()
        else:
            return pyglet.event.EVENT_UNHANDLED

    def on_draw(self):
        self.clear()
        self.view.batch.draw()
