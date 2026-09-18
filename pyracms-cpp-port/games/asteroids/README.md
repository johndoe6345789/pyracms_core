# Asteroids

Vector-style space shooter: rotate, thrust, shoot rocks that split, survive waves.

Engine: **pygame**. Drawn entirely with shapes, no external assets.

## Controls

Left/Right rotate, Up thrust, Space fire, P pause, R restart, Esc quit.

## Run

```
pip install -r requirements.txt
python main.py
```

## Test (headless)

```
pip install pytest
SDL_VIDEODRIVER=dummy python -m pytest
```

Game rules live in the pygame-free `asteroids_*.py` modules (`_game`, `_geom`, `_ship`, `_spawn`, `_collide`); `_render.py` and `main.py` are thin pygame glue. Tests need no display.

## Package

```
pip install -r ../requirements-dev.txt -r requirements.txt
python build.py        # -> dist/asteroids[.exe]
```

Metadata for the PyraCMS/Hypernucleus catalogue is in `game.json`.
