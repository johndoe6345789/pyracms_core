"""Asteroids-like (pygame). Arrows steer, Space fires, P pause, R restart."""
import os
import sys

import pygame

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from asteroids_game import AsteroidsGame  # noqa: E402
from asteroids_geom import H, W  # noqa: E402
from asteroids_render import draw  # noqa: E402


def read_input(k):
    right = k[pygame.K_RIGHT] or k[pygame.K_d]
    left = k[pygame.K_LEFT] or k[pygame.K_a]
    turn = int(bool(right)) - int(bool(left))
    return turn, bool(k[pygame.K_UP] or k[pygame.K_w])


def main():
    pygame.init()
    screen = pygame.display.set_mode((W, H))
    pygame.display.set_caption("Asteroids")
    font, big = pygame.font.Font(None, 28), pygame.font.Font(None, 56)
    clock, g, running = pygame.time.Clock(), AsteroidsGame(), True
    while running:
        dt = min(clock.tick(60) / 1000.0, 0.05)
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                running = False
            elif e.type == pygame.KEYDOWN:
                running = running and e.key != pygame.K_ESCAPE
                if e.key == pygame.K_p:
                    g.toggle_pause()
                elif e.key == pygame.K_r and g.game_over:
                    g.reset()
        k = pygame.key.get_pressed()
        turn, thrust = read_input(k)
        if k[pygame.K_SPACE]:
            g.shoot()
        g.update(dt, turn, thrust)
        draw(screen, g, font, big, thrust)
        pygame.display.flip()
    pygame.quit()


if __name__ == "__main__":
    main()
