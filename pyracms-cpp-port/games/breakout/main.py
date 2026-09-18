"""Breakout (pygame). Left/Right or A/D move, Space launch, P, R, Esc."""
import os
import sys

import pygame

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from breakout_consts import H, W  # noqa: E402
from breakout_logic import Breakout  # noqa: E402
from breakout_render import draw  # noqa: E402


def main():
    pygame.init()
    screen = pygame.display.set_mode((W, H))
    pygame.display.set_caption("Breakout")
    font, big = pygame.font.Font(None, 28), pygame.font.Font(None, 46)
    clock, g, running = pygame.time.Clock(), Breakout(), True
    while running:
        dt = min(clock.tick(60) / 1000.0, 0.05)
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                running = False
            elif e.type == pygame.KEYDOWN:
                running = running and e.key != pygame.K_ESCAPE
                if e.key == pygame.K_SPACE:
                    g.launch()
                elif e.key == pygame.K_p:
                    g.toggle_pause()
                elif e.key == pygame.K_r and g.game_over:
                    g.reset()
        k = pygame.key.get_pressed()
        right = k[pygame.K_RIGHT] or k[pygame.K_d]
        left = k[pygame.K_LEFT] or k[pygame.K_a]
        g.move_paddle(int(bool(right)) - int(bool(left)), dt)
        g.update(dt)
        draw(screen, g, font, big)
        pygame.display.flip()
    pygame.quit()


if __name__ == "__main__":
    main()
