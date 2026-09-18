from asteroids_game import AsteroidsGame
from asteroids_geom import Asteroid, Bullet, SIZE_RADIUS, SIZE_SCORE
from asteroids_helpers import dummy_rock, empty_game


def test_shoot_cooldown_and_limit():
    g = empty_game()
    assert g.shoot() and not g.shoot()
    for _ in range(10):
        g.cooldown = 0
        g.shoot()
    assert len(g.bullets) == 6


def test_no_shoot_when_paused_or_over():
    g = empty_game()
    g.paused = True
    assert not g.shoot()


def test_bullets_expire_and_move():
    g = empty_game()
    g.asteroids = [dummy_rock()]
    g.bullets = [Bullet(50, 50, 10, 0, 2.0, ttl=0.05)]
    g.update(0.1)
    assert g.bullets == []


def test_clearing_wave_advances_level():
    g = empty_game()
    g.update(0.016)
    assert g.level == 2 and len(g.asteroids) == 3 + 2


def test_bullet_hit_scores_through_update():
    g = empty_game()
    g.asteroids = [Asteroid(100, 100, 0, 0, SIZE_RADIUS[3], 3)]
    g.bullets = [Bullet(100, 100, 0, 0, 2.0)]
    g.update(0.0)
    assert g.score == SIZE_SCORE[3]


def test_pause_freezes_and_reset():
    g = AsteroidsGame(seed=1)
    pos = [(a.x, a.y) for a in g.asteroids]
    g.toggle_pause()
    g.update(1.0)
    assert pos == [(a.x, a.y) for a in g.asteroids]
    g.paused = False
    g.game_over, g.score = True, 50
    g.toggle_pause()
    assert not g.paused
    g.reset()
    assert g.score == 0 and not g.game_over
