from snake_logic import DOWN, LEFT, RIGHT, UP, SnakeGame


def test_moves_right_and_keeps_length():
    g = SnakeGame(seed=1)
    head = g.snake[0]
    g.food = (0, 0)
    g.step()
    assert g.snake[0] == (head[0] + 1, head[1]) and len(g.snake) == 3


def test_cannot_reverse():
    g = SnakeGame(seed=1)
    g.turn(LEFT)
    g.step()
    assert g.direction == RIGHT


def test_eating_grows_and_scores():
    g = SnakeGame(seed=1)
    hx, hy = g.snake[0]
    g.food = (hx + 1, hy)
    g.step()
    assert g.score == 1 and len(g.snake) == 4 and g.food not in g.snake


def test_wall_collision_ends_game():
    g = SnakeGame(cols=6, rows=6, seed=1)
    g.food = (0, 0)
    for _ in range(10):
        g.step()
    assert g.game_over


def test_self_collision():
    g = SnakeGame(seed=1)
    g.snake = [(5, 5), (5, 6), (4, 6), (4, 5), (4, 4), (5, 4)]
    g.direction = g._pending = UP
    g.food = (0, 0)
    g.turn(LEFT)
    g.step()  # head -> (4,5) which is body
    assert g.game_over


def test_pause_blocks_step_and_restart_resets():
    g = SnakeGame(seed=1)
    head = g.snake[0]
    g.toggle_pause()
    g.step()
    assert g.snake[0] == head
    g.game_over = True
    g.score = 9
    g.reset()
    assert not g.game_over and g.score == 0


def test_speed_ramps():
    g = SnakeGame(seed=1)
    base = g.speed
    g.score = 20
    assert g.speed > base and g.speed <= 20


def test_tail_cell_is_safe_when_not_eating():
    g = SnakeGame(seed=1)
    g.snake = [(2, 2), (2, 3), (3, 3), (3, 2)]  # 2x2 loop
    g.direction = g._pending = UP
    g.food = (9, 9)
    g.turn(RIGHT)
    g.step()
    assert not g.game_over
