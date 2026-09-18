from asteroids_game import AsteroidsGame
from asteroids_geom import Asteroid


def empty_game():
    g = AsteroidsGame(seed=3)
    g.asteroids = []
    g.ship.invuln = 0
    return g


def dummy_rock():
    return Asteroid(0, 0, 0, 0, 1, 1)  # tiny: keeps the wave from respawning
