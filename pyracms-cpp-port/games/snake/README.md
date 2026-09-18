# Snake

Classic Snake with speed ramp, pause and restart. Pure shapes, no assets.

Engine: **pygame**. Drawn entirely with shapes, no external assets.

## Controls

Arrows / WASD move, P pause, R restart after game over, Esc quit.

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

Game rules live in `snake_logic.py` (no rendering imports); `snake_render.py` and `main.py` are thin pygame glue. Tests need no display.

## Package

```
pip install -r ../requirements-dev.txt -r requirements.txt
python build.py        # -> dist/snake[.exe]
```

Metadata for the PyraCMS/Hypernucleus catalogue is in `game.json`.
