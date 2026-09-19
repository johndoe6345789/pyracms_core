# Downloadable game archives (dev seed)

The demo seed registers the six Python games in `games/` and attaches a real
source archive to each published revision, so the Hypernucleus launcher can
download and install them from a fresh local stack.

## What is uploaded

`scripts/game_archive.py` zips one `games/<name>/` folder into
`<name>-<version>.zip`:

* one top-level folder `<name>/` (what `ArchiveExtractor::installLayout`
  expects), holding the code, `game.json` and `requirements.txt`;
* excluded: `tests/`, `__pycache__/`, `dist/`, `build/`, `build.py`,
  `conftest.py`, `.coveragerc`, `pytest.ini`, `*.pyc`;
* deterministic: sorted entries, fixed timestamps and modes, stored (no
  deflate), CRLF normalised in text files, so the sha256 is stable across
  machines. The launcher starts `main.py` (game.json `entry`) with the game
  folder as cwd and installs `pipRequirements` (pygame-ce / pyglet) from
  PyPI into a per-game folder.

## How it is attached

`scripts/seed_archive.py` (called by `scripts/seed_games.py`):

1. builds the zip and its sha256;
2. a revision of the page whose stored sha256 is equal -> nothing to do;
3. otherwise the game.json version is used if it has no source yet, else a
   new revision `<version>.<n>` is created (`1.0.0.1`, `1.0.0.2`, ...);
4. `POST /api/files` (upload), `POST .../revisions/<ver>/source`
   `{fileUuid}`, publish. Size and sha256 are stored by the file service and
   appear in `GET /api/gamedep/catalog` (`revisions[].url|size|sha256`);
   files are served anonymously for public published games.

Re-running is a no-op while the games are unchanged.

## Running it

```sh
# against the dev stack (UI/API on :3199, tenant 1)
HN_API_URL=http://localhost:3199 HN_API_TENANT_ID=1 \
  python scripts/seed_games.py                 # register + archives
  python scripts/seed_games.py --archives-only # archives only
```

`HN_API_TENANT_ID` scopes the gamedep calls to a site (the shell seed does
the same with `?tenant_id=`). `backend/seed_games.sh` calls the script
automatically when `python3` exists in the backend container and
`docker-compose.yml`'s `./games` and `./scripts` mounts are present. The
stock runtime image has no Python, so on a stock stack run the command above
once from the host.

Check: `curl "http://localhost:3199/api/gamedep/catalog?tenant_id=1"`, then
download `/api/files/<uuid>` without a token and compare its sha256.
