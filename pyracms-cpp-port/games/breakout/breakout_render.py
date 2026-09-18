"""Breakout drawing (pygame). Thin glue, excluded from coverage."""
import pygame

from breakout_bricks import brick_rect
from breakout_consts import BALL_R, PADDLE_H, PADDLE_W, PADDLE_Y

BG, TEXT = (14, 16, 24), (230, 230, 240)
ROW_COLORS = [(230, 90, 90), (240, 160, 70), (240, 220, 80),
              (100, 210, 110), (90, 150, 230)]


def banner_text(g):
    if g.game_over:
        return "GAME OVER - press R"
    if g.paused:
        return "PAUSED - press P"
    return "Press Space to launch" if g.stuck else None


def draw(screen, g, font, big):
    screen.fill(BG)
    for c, r in g.bricks:
        x, y, w, h = brick_rect(c, r)
        pygame.draw.rect(screen, ROW_COLORS[r % len(ROW_COLORS)],
                         (x + 1, y + 1, w - 2, h - 2), border_radius=3)
    paddle = (g.paddle_x - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H)
    pygame.draw.rect(screen, TEXT, paddle, border_radius=5)
    pygame.draw.circle(screen, (255, 210, 110), (int(g.bx), int(g.by)),
                       BALL_R)
    hud = f"Score {g.score}   Lives {g.lives}   Level {g.level}"
    screen.blit(font.render(hud, True, TEXT), (10, 8))
    text = banner_text(g)
    if text:
        s = big.render(text, True, TEXT)
        screen.blit(s, s.get_rect(center=screen.get_rect().center))
