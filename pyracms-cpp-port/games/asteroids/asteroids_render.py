"""Asteroids drawing (pygame). Thin glue, excluded from coverage."""
import math

import pygame

from asteroids_geom import H, W

FG, BG = (225, 230, 245), (8, 9, 16)
SHIP_PTS = [(1.3, 0), (-1, 0.8), (-0.6, 0), (-1, -0.8)]
FLAME_PTS = [(-0.7, 0.35), (-1.6, 0), (-0.7, -0.35)]


def poly(cx, cy, angle, pts, scale=1.0):
    c, s = math.cos(angle), math.sin(angle)
    return [(cx + (px * c - py * s) * scale, cy + (px * s + py * c) * scale)
            for px, py in pts]


def rock_points(a):
    n = 10
    out = []
    for i in range(n):
        rad = 0.85 + 0.15 * math.sin(i * 2.7 + a.size)
        out.append((math.cos(i / n * math.tau) * rad,
                    math.sin(i / n * math.tau) * rad))
    return out


def draw_ship(screen, s, thrusting):
    pts = poly(s.x, s.y, s.angle, SHIP_PTS, 12)
    pygame.draw.polygon(screen, FG, pts, 2)
    if thrusting:
        flame = poly(s.x, s.y, s.angle, FLAME_PTS, 12)
        pygame.draw.polygon(screen, (255, 140, 60), flame, 2)


def draw(screen, g, font, big, thrusting):
    screen.fill(BG)
    for a in g.asteroids:
        pts = poly(a.x, a.y, a.angle, rock_points(a), a.r)
        pygame.draw.polygon(screen, FG, pts, 2)
    for b in g.bullets:
        pygame.draw.circle(screen, (255, 220, 120), (int(b.x), int(b.y)), 2)
    s = g.ship
    if not g.game_over and (s.invuln <= 0 or int(s.invuln * 10) % 2 == 0):
        draw_ship(screen, s, thrusting)
    hud = f"Score {g.score}   Lives {max(g.lives, 0)}   Wave {g.level}"
    screen.blit(font.render(hud, True, FG), (10, 8))
    banner = "GAME OVER - press R" if g.game_over else None
    banner = banner or ("PAUSED - press P" if g.paused else None)
    if banner:
        t = big.render(banner, True, FG)
        screen.blit(t, t.get_rect(center=(W // 2, H // 2)))
