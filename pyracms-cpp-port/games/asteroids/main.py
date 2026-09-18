"""Asteroids-like (pygame). Left/Right rotate, Up thrust, Space fire, P pause, R restart."""
import math
import os
import sys

import pygame

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import asteroids_logic as L  # noqa: E402

FG, BG = (225, 230, 245), (8, 9, 16)


def poly(cx, cy, angle, pts, scale=1.0):
    c, s = math.cos(angle), math.sin(angle)
    return [(cx + (px * c - py * s) * scale, cy + (px * s + py * c) * scale) for px, py in pts]


def rock_points(a):
    n = 10
    out = []
    for i in range(n):
        rad = 0.85 + 0.15 * math.sin(i * 2.7 + a.size)
        out.append((math.cos(i / n * math.tau) * rad, math.sin(i / n * math.tau) * rad))
    return out


def draw(screen, g, font, big, thrusting):
    screen.fill(BG)
    for a in g.asteroids:
        pygame.draw.polygon(screen, FG, poly(a.x, a.y, a.angle, rock_points(a), a.r), 2)
    for b in g.bullets:
        pygame.draw.circle(screen, (255, 220, 120), (int(b.x), int(b.y)), 2)
    s = g.ship
    if not g.game_over and (s.invuln <= 0 or int(s.invuln * 10) % 2 == 0):
        pygame.draw.polygon(screen, FG, poly(s.x, s.y, s.angle, [(1.3, 0), (-1, 0.8), (-0.6, 0), (-1, -0.8)], 12), 2)
        if thrusting:
            pygame.draw.polygon(screen, (255, 140, 60), poly(s.x, s.y, s.angle, [(-0.7, 0.35), (-1.6, 0), (-0.7, -0.35)], 12), 2)
    screen.blit(font.render(f"Score {g.score}   Lives {max(g.lives, 0)}   Wave {g.level}", True, FG), (10, 8))
    banner = "GAME OVER - press R" if g.game_over else "PAUSED - press P" if g.paused else None
    if banner:
        t = big.render(banner, True, FG)
        screen.blit(t, t.get_rect(center=(L.W // 2, L.H // 2)))


def main():
    pygame.init()
    screen = pygame.display.set_mode((L.W, L.H))
    pygame.display.set_caption("Asteroids")
    font, big = pygame.font.Font(None, 28), pygame.font.Font(None, 56)
    clock = pygame.time.Clock()
    g = L.AsteroidsGame()
    running = True
    while running:
        dt = min(clock.tick(60) / 1000.0, 0.05)
        for e in pygame.event.get():
            if e.type == pygame.QUIT or (e.type == pygame.KEYDOWN and e.key == pygame.K_ESCAPE):
                running = False
            elif e.type == pygame.KEYDOWN:
                if e.key == pygame.K_p:
                    g.toggle_pause()
                elif e.key == pygame.K_r and g.game_over:
                    g.reset()
        k = pygame.key.get_pressed()
        turn = int(bool(k[pygame.K_RIGHT] or k[pygame.K_d])) - int(bool(k[pygame.K_LEFT] or k[pygame.K_a]))
        thrust = bool(k[pygame.K_UP] or k[pygame.K_w])
        if k[pygame.K_SPACE]:
            g.shoot()
        g.update(dt, turn, thrust)
        draw(screen, g, font, big, thrust)
        pygame.display.flip()
    pygame.quit()


if __name__ == "__main__":
    main()
