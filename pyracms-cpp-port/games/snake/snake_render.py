"""Snake drawing (pygame). Thin glue, excluded from coverage."""
import pygame

CELL = 28
BG, GRID = (18, 20, 28), (26, 29, 40)
SNAKE, HEAD = (80, 200, 120), (140, 240, 170)
FOOD, TEXT = (240, 90, 90), (230, 230, 240)


def _cell_rect(x, y, pad=0):
    return (x * CELL + pad, y * CELL + pad, CELL - 2 * pad, CELL - 2 * pad)


def draw_board(screen, game):
    screen.fill(BG)
    for x in range(game.cols):
        for y in range(game.rows):
            if (x + y) % 2:
                pygame.draw.rect(screen, GRID, _cell_rect(x, y))
    fx, fy = game.food
    center = (fx * CELL + CELL // 2, fy * CELL + CELL // 2)
    pygame.draw.circle(screen, FOOD, center, CELL // 2 - 3)
    for i, (x, y) in enumerate(game.snake):
        color = HEAD if i == 0 else SNAKE
        pygame.draw.rect(screen, color, _cell_rect(x, y, 1), border_radius=6)


def banner_text(game):
    if game.game_over:
        return "GAME OVER - press R"
    return "PAUSED - press P" if game.paused else None


def draw(screen, game, font, big):
    draw_board(screen, game)
    screen.blit(font.render(f"Score {game.score}", True, TEXT), (8, 6))
    banner = banner_text(game)
    if banner:
        s = big.render(banner, True, TEXT)
        screen.blit(s, s.get_rect(center=screen.get_rect().center))
