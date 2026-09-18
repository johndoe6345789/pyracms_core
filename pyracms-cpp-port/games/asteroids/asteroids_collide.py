"""Collision resolution for Asteroids. No pygame import."""
from __future__ import annotations

from asteroids_geom import SIZE_SCORE, circles_hit
from asteroids_spawn import split


def bullets_vs_rocks(g):
    for b in list(g.bullets):
        for a in list(g.asteroids):
            if circles_hit(b.x, b.y, b.r, a.x, a.y, a.r):
                g.bullets.remove(b)
                g.asteroids.remove(a)
                g.asteroids.extend(split(g.rng, g.level, a))
                g.score += SIZE_SCORE[a.size]
                break


def ship_vs_rocks(g):
    s = g.ship
    if s.invuln > 0:
        return
    for a in g.asteroids:
        if circles_hit(s.x, s.y, s.r, a.x, a.y, a.r):
            g.lives -= 1
            if g.lives <= 0:
                g.game_over = True
            else:
                g.respawn_ship()
            return
