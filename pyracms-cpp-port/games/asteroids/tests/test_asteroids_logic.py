import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import asteroids_logic as L  # noqa: E402


def empty_game():
    g = L.AsteroidsGame(seed=3)
    g.asteroids = []
    g.ship.invuln = 0
    return g


def dummy_rock():
    return L.Asteroid(0, 0, 0, 0, 1, 1)  # tiny, keeps the wave from respawning


def test_wrap():
    assert L.wrap(L.W + 5, -3) == (5, L.H - 3)


def test_circles_hit():
    assert L.circles_hit(0, 0, 5, 9, 0, 5)
    assert not L.circles_hit(0, 0, 5, 11, 0, 5)


def test_thrust_accelerates_in_facing_direction():
    g = empty_game()
    g.asteroids = [dummy_rock()]
    g.update(0.1, thrust=True)
    assert g.ship.vy < 0 and abs(g.ship.vx) < 1e-6  # facing up


def test_speed_capped():
    g = empty_game()
    g.asteroids = [dummy_rock()]
    for _ in range(300):
        g.update(0.05, thrust=True)
        g.asteroids = [dummy_rock()]
    assert math.hypot(g.ship.vx, g.ship.vy) <= L.Ship.MAX_SPEED + 1e-6


def test_shoot_cooldown_and_limit():
    g = empty_game()
    assert g.shoot() and not g.shoot()
    for _ in range(10):
        g.cooldown = 0
        g.shoot()
    assert len(g.bullets) == 6


def test_bullet_destroys_and_splits_and_scores():
    g = empty_game()
    g.asteroids = [L.Asteroid(100, 100, 0, 0, L.SIZE_RADIUS[3], 3)]
    g.bullets = [L.Bullet(100, 100, 0, 0, 2.0)]
    g._collide()
    assert g.score == L.SIZE_SCORE[3] and len(g.asteroids) == 2
    assert all(c.size == 2 for c in g.asteroids) and not g.bullets


def test_smallest_asteroid_does_not_split():
    g = empty_game()
    assert g.split(L.Asteroid(0, 0, size=1)) == []


def test_ship_hit_loses_life_then_game_over():
    g = empty_game()
    g.asteroids = [L.Asteroid(g.ship.x, g.ship.y, 0, 0, 30, 2)]
    g._collide()
    assert g.lives == 2 and g.ship.invuln > 0
    g.lives = 1
    g.ship.invuln = 0
    g._collide()
    assert g.game_over


def test_invulnerable_ship_survives():
    g = empty_game()
    g.ship.invuln = 1
    g.asteroids = [L.Asteroid(g.ship.x, g.ship.y, 0, 0, 30, 2)]
    g._collide()
    assert g.lives == 3


def test_clearing_wave_advances_level():
    g = empty_game()
    g.update(0.016)
    assert g.level == 2 and len(g.asteroids) == 3 + 2


def test_pause_freezes_and_reset():
    g = L.AsteroidsGame(seed=1)
    pos = [(a.x, a.y) for a in g.asteroids]
    g.toggle_pause()
    g.update(1.0)
    assert pos == [(a.x, a.y) for a in g.asteroids]
    g.game_over, g.score = True, 50
    g.reset()
    assert g.score == 0 and not g.game_over
