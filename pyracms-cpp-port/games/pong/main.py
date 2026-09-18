"""Pong (pyglet). W/S move your paddle vs the CPU, or Up/Down with --two-player.
P pause, R restart, Esc quit."""
import os
import sys

import pyglet
from pyglet.window import key

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pong_logic as L  # noqa: E402


class PongWindow(pyglet.window.Window):
    def __init__(self, two_player=False):
        super().__init__(L.W, L.H, caption="Pong")
        self.two_player = two_player
        self.game = L.Pong()
        self.keys = key.KeyStateHandler()
        self.push_handlers(self.keys)
        self.batch = pyglet.graphics.Batch()
        white = (235, 235, 245)
        self.net = [pyglet.shapes.Rectangle(L.W / 2 - 2, y, 4, 16, color=(70, 72, 90), batch=self.batch)
                    for y in range(0, L.H, 32)]
        self.lp = pyglet.shapes.Rectangle(0, 0, L.PADDLE_W, L.PADDLE_H, color=white, batch=self.batch)
        self.rp = pyglet.shapes.Rectangle(0, 0, L.PADDLE_W, L.PADDLE_H, color=white, batch=self.batch)
        self.ball = pyglet.shapes.Circle(0, 0, L.BALL_R, color=(255, 210, 110), batch=self.batch)
        kw = dict(font_size=32, anchor_x="center", batch=self.batch, color=(230, 230, 240, 255))
        self.s0 = pyglet.text.Label("0", x=L.W / 2 - 60, y=L.H - 60, **kw)
        self.s1 = pyglet.text.Label("0", x=L.W / 2 + 60, y=L.H - 60, **kw)
        self.banner = pyglet.text.Label("", x=L.W / 2, y=L.H / 2 - 60, **{**kw, "font_size": 22})
        pyglet.clock.schedule_interval(self.update, 1 / 120)

    def update(self, dt):
        g = self.game
        dt = min(dt, 0.05)
        if not (g.paused or g.game_over):
            g.move_paddle(0, int(bool(self.keys[key.W])) - int(bool(self.keys[key.S])), dt)
            if self.two_player:
                g.move_paddle(1, int(bool(self.keys[key.UP])) - int(bool(self.keys[key.DOWN])), dt)
            else:
                g.ai(dt)
        g.update(dt)
        self.lp.position = (L.LEFT_X - L.PADDLE_W / 2, g.left_y - L.PADDLE_H / 2)
        self.rp.position = (L.RIGHT_X - L.PADDLE_W / 2, g.right_y - L.PADDLE_H / 2)
        self.ball.position = (g.bx, g.by)
        self.s0.text, self.s1.text = str(g.score[0]), str(g.score[1])
        if g.game_over:
            self.banner.text = f"{'Left' if g.winner == 0 else 'Right'} wins - press R"
        else:
            self.banner.text = "PAUSED" if g.paused else ""

    def on_key_press(self, symbol, modifiers):
        if symbol == key.P:
            self.game.toggle_pause()
        elif symbol == key.R:
            self.game.reset()
        else:
            return pyglet.event.EVENT_UNHANDLED

    def on_draw(self):
        self.clear()
        self.batch.draw()


def main():
    PongWindow(two_player="--two-player" in sys.argv)
    pyglet.app.run()


if __name__ == "__main__":
    main()
