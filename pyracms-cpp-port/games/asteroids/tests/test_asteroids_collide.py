from asteroids_collide import bullets_vs_rocks, ship_vs_rocks
from asteroids_geom import Asteroid, Bullet, SIZE_RADIUS, SIZE_SCORE
from asteroids_helpers import empty_game


def test_bullet_destroys_and_splits_and_scores():
    g = empty_game()
    g.asteroids = [Asteroid(100, 100, 0, 0, SIZE_RADIUS[3], 3)]
    g.bullets = [Bullet(100, 100, 0, 0, 2.0)]
    bullets_vs_rocks(g)
    assert g.score == SIZE_SCORE[3] and len(g.asteroids) == 2
    assert all(c.size == 2 for c in g.asteroids) and not g.bullets


def test_ship_hit_loses_life_then_game_over():
    g = empty_game()
    g.asteroids = [Asteroid(g.ship.x, g.ship.y, 0, 0, 30, 2)]
    ship_vs_rocks(g)
    assert g.lives == 2 and g.ship.invuln > 0
    g.lives = 1
    g.ship.invuln = 0
    ship_vs_rocks(g)
    assert g.game_over


def test_invulnerable_ship_survives():
    g = empty_game()
    g.ship.invuln = 1
    g.asteroids = [Asteroid(g.ship.x, g.ship.y, 0, 0, 30, 2)]
    ship_vs_rocks(g)
    assert g.lives == 3
