"""Asteroid creation helpers. No pygame import."""
from __future__ import annotations

import math

from asteroids_geom import H, SIZE_RADIUS, W, Asteroid, circles_hit


def make_asteroid(rng, level, x, y, size):
    a = rng.uniform(0, math.tau)
    speed = rng.uniform(30, 70) * (1 + (3 - size) * 0.5) + level * 4
    return Asteroid(x, y, math.cos(a) * speed, math.sin(a) * speed,
                    SIZE_RADIUS[size], size, rng.uniform(-1.5, 1.5),
                    rng.uniform(0, math.tau))


def spawn_wave(rng, level, ship):
    """3 + level big rocks, kept away from the ship."""
    rocks = []
    for _ in range(3 + level):
        while True:
            x, y = rng.uniform(0, W), rng.uniform(0, H)
            if not circles_hit(x, y, SIZE_RADIUS[3], ship.x, ship.y, 140):
                break
        rocks.append(make_asteroid(rng, level, x, y, 3))
    return rocks


def split(rng, level, rock):
    """Children for a destroyed asteroid (none for the smallest)."""
    if rock.size == 1:
        return []
    return [make_asteroid(rng, level, rock.x, rock.y, rock.size - 1)
            for _ in range(2)]
