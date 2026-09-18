# Python games

Small, dependency-light games that ship through PyraCMS as `game` pages and are downloaded by the
Hypernucleus launcher. Every game draws with shapes only (no assets), keeps its rules in small
pygame/pyglet-free modules (`*_logic.py` and helpers; rendering lives in
`main.py` and `*_render|view|window.py` glue) and has headless pytest tests.
Every file is at most 80 lines and 80 columns.

| Game | Engine | Controls | Logic module |
|---|---|---|---|
| [snake](snake) | pygame 2.6.1 | Arrows/WASD, P pause, R restart | `snake_logic.py` |
| [asteroids](asteroids) | pygame 2.6.1 | Left/Right, Up thrust, Space fire, P, R | `asteroids_game.py` |
| [tetris](tetris) | pyglet 2.1.16 | Left/Right, Up rotate, Down, Space drop, P, R | `tetris_logic.py` |
| [pong](pong) | pyglet 2.1.16 | W/S (or `--two-player` Up/Down), P, R | `pong_logic.py` |
| [breakout](breakout) | pygame 2.6.1 | Left/Right or A/D, Space launch, P, R | `breakout_logic.py` |
| [twenty48](twenty48) (2048) | pyglet 2.1.16 | Arrows/WASD, R | `twenty48_logic.py` |

## Run

```
cd games/snake
pip install -r requirements.txt
python main.py
```

## Test (no display needed)

```
pip install -r requirements-dev.txt
cd games && python -m pytest -q --cov --cov-config=.coveragerc   # all games
cd scripts && python -m pytest -q --cov --cov-config=.coveragerc # scripts
```

Both fail under 80% coverage (`.coveragerc`); the rendering glue (`main.py`,
`build.py`, `*_render.py`, `*_view.py`, `*_window.py`) is excluded, everything
else (game logic, `build_game.py`, and all of `scripts/`) is measured.
A single game also works: `python -m pytest -q snake`. Tests find the game
modules through `pythonpath` in `games/pytest.ini` (add new games there).

## Package a standalone binary

```
pip install -r requirements-dev.txt -r snake/requirements.txt
python build_game.py snake          # or: python build_game.py --all   or: python snake/build.py
# -> snake/dist/snake(.exe)   (macOS: snake/dist/snake.app)
```

CI (`.github/workflows/launcher-build.yml`) runs the coverage-gated tests
above, then does this for windows/macos/linux on x86_64 and arm64 and uploads
`games-<os>-<arch>` artifacts plus one `*.manifest.json` per binary.

## game.json

```json
{ "name": "snake", "displayName": "Snake", "description": "...", "version": "1.0.0",
  "engine": "pygame", "tags": ["arcade"], "entry": "main.py", "moduleType": "python",
  "pipRequirements": ["pygame==2.6.1"], "dependencies": [] }
```

* `pipRequirements` - dependencies resolved from PyPI first (pinned; every game declares its engine here).
* `dependencies` - only for packages that are **not** on PyPI: `{"name","version","displayName","description",
  "file"}` where `file` is a wheel/zip relative to the game directory. They are published as PyraCMS `dep` pages
  and linked to the game via the dependency endpoint, so the launcher downloads the game and every dep.

## Registering with the backend

```
python ../scripts/seed_games.py                 # localhost:8080, admin/password123 (backend/seed.sh defaults)
HN_API_URL=https://cms.example.com HN_API_USERNAME=owner HN_API_PASSWORD=... python ../scripts/seed_games.py
```

Accounts are per tenant: set `HN_API_TENANT=<slug>` to log in as a tenant user; site owners are platform accounts
with no tenant (leave it unset). `HN_API_TOKEN` skips login. This creates the page, revision, tags and custom
deps. Binaries and hashes are attached by `scripts/publish_manifest.py` (run by CI when the `HN_API_URL` and
`HN_API_TOKEN` secrets exist, otherwise skipped):

```
python ../scripts/publish_manifest.py --files-dir artifacts 'artifacts/**/*.manifest.json'
python ../scripts/publish_manifest.py --dry-run 'artifacts/**/*.manifest.json'
```

The backend's architecture table has `x86_64` and `arm` but no `arm64`; the publisher maps arm64 to `arm`
(override with `HN_ARM64_ARCH_NAME` if you add an `arm64` row).
