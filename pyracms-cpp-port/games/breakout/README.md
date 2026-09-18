# Breakout

Bounce the ball off your paddle and clear every brick; three lives, faster each level.

Engine: **pygame**. Drawn entirely with shapes, no external assets.

## Controls

Left/Right or A/D move, Space launch, P pause, R restart.

## Run

```
pip install -r requirements.txt
python main.py
```

## Test (headless)

```
pip install pytest
python -m pytest
```

Rules live in the pygame-free `breakout_logic.py`, `breakout_bricks.py`, `breakout_physics.py` and `breakout_consts.py`; `breakout_render.py` and `main.py` are thin glue.

## Package

```
pip install -r ../requirements-dev.txt -r requirements.txt
python build.py        # -> dist/breakout[.exe]
```

Metadata for the PyraCMS/Hypernucleus catalogue is in `game.json` (`pipRequirements` pins the engine).
