import math

from asteroids_geom import H, W, Asteroid, Bullet, circles_hit, wrap
from asteroids_helpers import dummy_rock, empty_game
from asteroids_ship import Ship


def test_wrap():
    assert wrap(W + 5, -3) == (5, H - 3)


def test_circles_hit():
    assert circles_hit(0, 0, 5, 9, 0, 5)
    assert not circles_hit(0, 0, 5, 11, 0, 5)


def test_body_move_wraps():
    b = Bullet(W - 1, 0, 100, 0)
    b.move(0.1)
    assert 0 <= b.x < W and isinstance(Asteroid(0, 0), Asteroid)


def test_thrust_accelerates_in_facing_direction():
    g = empty_game()
    g.asteroids = [dummy_rock()]
    g.update(0.1, thrust=True)
    assert g.ship.vy < 0 and abs(g.ship.vx) < 1e-6  # facing up


def test_speed_capped():
    s = Ship(100, 100, invuln=0)
    for _ in range(300):
        s.steer(0.05, thrust=True)
    assert math.hypot(s.vx, s.vy) <= Ship.MAX_SPEED + 1e-6


def test_turning_and_invulnerability_decay():
    s = Ship(100, 100, invuln=1.0)
    a = s.angle
    s.steer(0.5, turn=1)
    assert s.angle > a and s.invuln == 0.5
