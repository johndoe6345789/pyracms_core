import random

from asteroids_geom import SIZE_RADIUS, Asteroid, circles_hit
from asteroids_ship import Ship
from asteroids_spawn import make_asteroid, spawn_wave, split


def test_wave_size_and_clearance():
    ship = Ship(450, 320)
    rocks = spawn_wave(random.Random(1), 2, ship)
    assert len(rocks) == 5
    assert not any(circles_hit(r.x, r.y, r.r, ship.x, ship.y, 140)
                   for r in rocks)


def test_make_asteroid_size():
    a = make_asteroid(random.Random(1), 1, 5, 6, 2)
    assert a.size == 2 and a.r == SIZE_RADIUS[2]


def test_split_children_and_smallest():
    rng = random.Random(1)
    kids = split(rng, 1, Asteroid(0, 0, size=3))
    assert len(kids) == 2 and all(k.size == 2 for k in kids)
    assert split(rng, 1, Asteroid(0, 0, size=1)) == []
