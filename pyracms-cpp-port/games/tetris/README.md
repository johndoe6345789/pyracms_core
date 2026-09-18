# Tetris

Falling blocks with 7-bag randomiser, ghost piece, wall kicks and levels, drawn with pyglet shapes and a Batch.

Engine: **pyglet**. Drawn entirely with shapes, no external assets.

## Controls

Left/Right move, Up rotate, Down soft drop, Space hard drop, P pause, R restart.

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

Game rules live in the pyglet-free `tetris_logic.py`, `tetris_moves.py`, `tetris_board.py` and `tetris_shapes.py`; `tetris_view.py`, `tetris_window.py` and `main.py` are thin pyglet glue. Tests need no display.

## Package

```
pip install -r ../requirements-dev.txt -r requirements.txt
python build.py        # -> dist/tetris[.exe]
```

Metadata for the PyraCMS/Hypernucleus catalogue is in `game.json`.
