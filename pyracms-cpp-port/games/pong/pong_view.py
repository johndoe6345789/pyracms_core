"""Pong widgets (pyglet). Thin glue, excluded from coverage."""
import pyglet

import pong_consts as C

WHITE = (235, 235, 245)


def banner_text(g):
    if g.game_over:
        side = "Left" if g.winner == 0 else "Right"
        return f"{side} wins - press R"
    return "PAUSED" if g.paused else ""


class View:
    def __init__(self):
        self.batch = pyglet.graphics.Batch()
        shape = pyglet.shapes
        self.net = [shape.Rectangle(C.W / 2 - 2, y, 4, 16,
                                    color=(70, 72, 90), batch=self.batch)
                    for y in range(0, C.H, 32)]
        self.lp = shape.Rectangle(0, 0, C.PADDLE_W, C.PADDLE_H,
                                  color=WHITE, batch=self.batch)
        self.rp = shape.Rectangle(0, 0, C.PADDLE_W, C.PADDLE_H,
                                  color=WHITE, batch=self.batch)
        self.ball = shape.Circle(0, 0, C.BALL_R, color=(255, 210, 110),
                                 batch=self.batch)
        kw = dict(font_size=32, anchor_x="center", batch=self.batch,
                  color=(230, 230, 240, 255))
        label = pyglet.text.Label
        self.s0 = label("0", x=C.W / 2 - 60, y=C.H - 60, **kw)
        self.s1 = label("0", x=C.W / 2 + 60, y=C.H - 60, **kw)
        kw["font_size"] = 22
        self.banner = label("", x=C.W / 2, y=C.H / 2 - 60, **kw)

    def refresh(self, g):
        self.lp.position = (C.LEFT_X - C.PADDLE_W / 2,
                            g.left_y - C.PADDLE_H / 2)
        self.rp.position = (C.RIGHT_X - C.PADDLE_W / 2,
                            g.right_y - C.PADDLE_H / 2)
        self.ball.position = (g.bx, g.by)
        self.s0.text, self.s1.text = str(g.score[0]), str(g.score[1])
        self.banner.text = banner_text(g)
