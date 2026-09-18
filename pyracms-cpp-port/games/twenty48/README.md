# 2048

Slide and merge numbered tiles to reach 2048.

Engine: **pyglet**. Drawn entirely with shapes, no external assets.

## Controls

Arrows/WASD slide the tiles, R restart.

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

Rules live in the pyglet-free `twenty48_logic.py` and `twenty48_board.py`; `twenty48_view.py`, `twenty48_window.py` and `main.py` are thin glue.

## Package

```
pip install -r ../requirements-dev.txt -r requirements.txt
python build.py        # -> dist/twenty48[.exe]
```

Metadata for the PyraCMS/Hypernucleus catalogue is in `game.json` (`pipRequirements` pins the engine).
