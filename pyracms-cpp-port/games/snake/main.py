"""Snake (pygame). Arrows/WASD move, P pause, R restart, Esc quit."""
import os
import sys

import pygame

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from snake_logic import DOWN, LEFT, RIGHT, UP, SnakeGame  # noqa: E402
from snake_render import CELL, draw  # noqa: E402

KEYS = {pygame.K_UP: UP, pygame.K_w: UP, pygame.K_DOWN: DOWN,
        pygame.K_s: DOWN, pygame.K_LEFT: LEFT, pygame.K_a: LEFT,
        pygame.K_RIGHT: RIGHT, pygame.K_d: RIGHT}


def on_key(game, key):
    if key in KEYS:
        game.turn(KEYS[key])
    elif key == pygame.K_p:
        game.toggle_pause()
    elif key == pygame.K_r and game.game_over:
        game.reset()


def main():
    pygame.init()
    game = SnakeGame()
    size = (game.cols * CELL, game.rows * CELL)
    screen = pygame.display.set_mode(size)
    pygame.display.set_caption("Snake")
    font, big = pygame.font.Font(None, 28), pygame.font.Font(None, 52)
    clock, acc, running = pygame.time.Clock(), 0.0, True
    while running:
        acc += clock.tick(60) / 1000.0
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                running = False
            elif e.type == pygame.KEYDOWN:
                running = running and e.key != pygame.K_ESCAPE
                on_key(game, e.key)
        while acc >= 1.0 / game.speed:
            acc -= 1.0 / game.speed
            game.step()
        draw(screen, game, font, big)
        pygame.display.flip()
    pygame.quit()


if __name__ == "__main__":
    main()
