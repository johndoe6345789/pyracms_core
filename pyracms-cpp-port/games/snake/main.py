"""Snake (pygame). Arrows/WASD move, P pause, R restart, Esc quit."""
import os
import sys

import pygame

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from snake_logic import DOWN, LEFT, RIGHT, UP, SnakeGame  # noqa: E402

CELL = 28
BG, GRID, SNAKE, HEAD, FOOD, TEXT = (18, 20, 28), (26, 29, 40), (80, 200, 120), (140, 240, 170), (240, 90, 90), (230, 230, 240)
KEYS = {pygame.K_UP: UP, pygame.K_w: UP, pygame.K_DOWN: DOWN, pygame.K_s: DOWN,
        pygame.K_LEFT: LEFT, pygame.K_a: LEFT, pygame.K_RIGHT: RIGHT, pygame.K_d: RIGHT}


def draw(screen, game, font, big):
    screen.fill(BG)
    for x in range(game.cols):
        for y in range(game.rows):
            if (x + y) % 2:
                pygame.draw.rect(screen, GRID, (x * CELL, y * CELL, CELL, CELL))
    fx, fy = game.food
    pygame.draw.circle(screen, FOOD, (fx * CELL + CELL // 2, fy * CELL + CELL // 2), CELL // 2 - 3)
    for i, (x, y) in enumerate(game.snake):
        pygame.draw.rect(screen, HEAD if i == 0 else SNAKE, (x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2), border_radius=6)
    screen.blit(font.render(f"Score {game.score}", True, TEXT), (8, 6))
    banner = "GAME OVER - press R" if game.game_over else "PAUSED - press P" if game.paused else None
    if banner:
        s = big.render(banner, True, TEXT)
        screen.blit(s, s.get_rect(center=screen.get_rect().center))


def main():
    pygame.init()
    game = SnakeGame()
    screen = pygame.display.set_mode((game.cols * CELL, game.rows * CELL))
    pygame.display.set_caption("Snake")
    font, big = pygame.font.Font(None, 28), pygame.font.Font(None, 52)
    clock = pygame.time.Clock()
    acc = 0.0
    running = True
    while running:
        dt = clock.tick(60) / 1000.0
        for e in pygame.event.get():
            if e.type == pygame.QUIT or (e.type == pygame.KEYDOWN and e.key == pygame.K_ESCAPE):
                running = False
            elif e.type == pygame.KEYDOWN:
                if e.key in KEYS:
                    game.turn(KEYS[e.key])
                elif e.key == pygame.K_p:
                    game.toggle_pause()
                elif e.key == pygame.K_r and game.game_over:
                    game.reset()
        acc += dt
        while acc >= 1.0 / game.speed:
            acc -= 1.0 / game.speed
            game.step()
        draw(screen, game, font, big)
        pygame.display.flip()
    pygame.quit()


if __name__ == "__main__":
    main()
