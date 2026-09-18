# Pong

Pong against a CPU paddle (or a friend with --two-player). Hit position steers the ball; first to 7 wins.

Engine: **pyglet**. Drawn entirely with shapes, no external assets.

## Controls

W/S move the left paddle; with --two-player Up/Down move the right one. P pause, R restart.

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

Game rules live in the pyglet-free `pong_logic.py`, `pong_ball.py` and `pong_consts.py`; `pong_view.py`, `pong_window.py` and `main.py` are thin pyglet glue. Tests need no display.

## Package

```
pip install -r ../requirements-dev.txt -r requirements.txt
python build.py        # -> dist/pong[.exe]
```

Metadata for the PyraCMS/Hypernucleus catalogue is in `game.json`.
