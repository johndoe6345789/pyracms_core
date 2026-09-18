"""Pure Snake logic. No pygame import; deterministic given a seed."""
from __future__ import annotations

import random
from dataclasses import dataclass, field

UP, DOWN, LEFT, RIGHT = (0, -1), (0, 1), (-1, 0), (1, 0)
OPPOSITE = {UP: DOWN, DOWN: UP, LEFT: RIGHT, RIGHT: LEFT}


@dataclass
class SnakeGame:
    cols: int = 24
    rows: int = 18
    seed: int | None = None
    snake: list = field(default_factory=list)  # head first
    direction: tuple = RIGHT
    food: tuple = (0, 0)
    score: int = 0
    game_over: bool = False
    paused: bool = False

    def __post_init__(self):
        self.rng = random.Random(self.seed)
        self.reset()

    def reset(self):
        cx, cy = self.cols // 2, self.rows // 2
        self.snake = [(cx, cy), (cx - 1, cy), (cx - 2, cy)]
        self.direction = RIGHT
        self._pending = RIGHT
        self.score = 0
        self.game_over = False
        self.paused = False
        self.food = self._place_food()

    def _place_food(self):
        free = [(x, y) for x in range(self.cols) for y in range(self.rows)
                if (x, y) not in self.snake]
        return self.rng.choice(free) if free else (-1, -1)

    def turn(self, new_dir):
        """Queue a turn; reversing straight into yourself is ignored."""
        if new_dir != OPPOSITE[self.direction]:
            self._pending = new_dir

    def toggle_pause(self):
        if not self.game_over:
            self.paused = not self.paused

    @property
    def speed(self):
        """Steps per second; ramps up with score."""
        return min(8 + self.score // 5, 20)

    def step(self):
        if self.game_over or self.paused:
            return
        self.direction = self._pending
        hx, hy = self.snake[0]
        head = (hx + self.direction[0], hy + self.direction[1])
        eating = head == self.food
        # the tail moves away unless we are growing
        body = self.snake if eating else self.snake[:-1]
        inside = 0 <= head[0] < self.cols and 0 <= head[1] < self.rows
        if not inside or head in body:
            self.game_over = True
            return
        self.snake.insert(0, head)
        if eating:
            self.score += 1
            self.food = self._place_food()
            if self.food == (-1, -1):  # board full: you win
                self.game_over = True
        else:
            self.snake.pop()
