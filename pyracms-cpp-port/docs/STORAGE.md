# Uploaded-file storage

PyraCMS keeps the bytes of every uploaded file (gallery pictures, admin files,
game and dependency binaries, avatars) in one pluggable store. The file's
metadata (name, type, size, sha256, owner, site) always stays in PostgreSQL.

| Backend | Where the bytes live | Use it when |
|---|---|---|
| `s3` (default; **the only production mode**) | an S3-compatible object store, `tenant-<siteId>-<uuid>` | always |
| `local` (development only) | `uploads_data` volume, `/app/uploads/<uuid>` | a throwaway dev box without the store |

With `PYRACMS_ENV=production` the backend **refuses to start** unless
`STORAGE_BACKEND=s3` (endpoint and both keys set), and never writes a new
file to local disk. Rows that still say `storage='local'` stay readable
(from the `uploads_data` volume) until `migrate-storage` (below) moves them.

The `s3` backend speaks the dialect of
[johndoe6345789/object-store](https://github.com/johndoe6345789/object-store):
path-style URLs (`/{bucket}/{key}`) and the header
`Authorization: AWS <access_key>:<secret_key>` (not SigV4, so it will not talk
to AWS S3 or MinIO as is). Any store implementing that small dialect works.
Keys are flat (`tenant-<siteId>-<uuid>`, thumbnails `tenant-<siteId>-thumb-<uuid>`,
site 0 = platform) because the store routes `/{bucket}/{key}` with a single
path segment; a key containing `/` returns 404 there.

## Configuration

Read from the environment only (never from a request, so users cannot point
the server at another host).

| Variable | Default | Meaning |
|---|---|---|
| `STORAGE_BACKEND` | `s3` in the compose files, code default `local` | `s3` or (dev only) `local`; production accepts only `s3` |
| `S3_ENDPOINT` | | e.g. `http://objectstore:9000` (an optional path prefix is kept) |
| `S3_BUCKET` | `pyracms` | 3-63 chars of `a-z 0-9 - .`; created on first use |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | | the store's API key; **required in production** |
| `S3_TIMEOUT_S` | `60` | per-request timeout (parts and completion get 600 s) |
| `MAX_UPLOAD_MB` | `25` | body cap of every ordinary request |
| `MAX_CHUNKED_UPLOAD_MB` | `1024` | largest file accepted through the chunked API |
| `UPLOAD_PART_MB` | `50` (1-90) | size of one chunk; must stay below the proxy's body cap |
| `STREAM_MIN_MB` | `8` | stored files at least this big are streamed to the client, not loaded into memory |

The backend refuses to start when `STORAGE_BACKEND=s3` lacks `S3_ENDPOINT`,
or, with `PYRACMS_ENV=production`, lacks either key.

Every file row records its backend in a `storage` column (`local` or `s3`,
added idempotently by `sql/070_file_storage.sql`; existing rows are `local`).
New uploads go to `STORAGE_BACKEND`; existing files are read from wherever
their row says, so **switching the backend never breaks old files** as long as
both stores stay reachable (keep the `uploads_data` volume mounted).
The S3 store is opened whenever `S3_ENDPOINT` is set, even with
`STORAGE_BACKEND=local`, so rows already in S3 keep working after switching back;
without an endpoint they answer `503`.

Failures are mapped without leaking internals: store unreachable or timed out
gives `503`, any other store error (bad key, 5xx) gives `502`, both with a
generic message; details go to the server log. A delete that cannot reach the
store keeps the database row so it can be retried.

## Big uploads: the chunked API

A proxy such as Cloudflare caps one request body at 100 MB, so a 1 GB game
archive cannot go up as one `POST /api/files`. Files over ~40 MB (the web
UI and `scripts/hn_http.py` decide this) use these routes instead; all need
the same login, tenant, rate limit and type rules as `POST /api/files`.

| Call | Meaning |
|---|---|
| `POST /api/files/uploads` `{filename,size,mimetype?,sha256?}` | starts an upload -> `{uploadId, partSize, maxParts}`; 413 above `MAX_CHUNKED_UPLOAD_MB`, 429 past 10 open uploads per user |
| `PUT /api/files/uploads/{uploadId}/parts/{n}` raw body <= `partSize` | stores part `n` (from 1) -> `{part,size,etag}` |
| `POST /api/files/uploads/{uploadId}/complete` | -> the same JSON as `POST /api/files` (`uuid`, `sha256`, `size`...); the `files` row gets `storage='s3'` |
| `DELETE /api/files/uploads/{uploadId}` | aborts and frees the parts |

Only the creating user (same site) can touch an upload; anyone else gets
404. Unfinished uploads are aborted after 24 h. Parts go to the store's
multipart API (`?uploads`, `?partNumber=N&uploadId=ID`, complete, abort), so
the backend holds at most one part (<= 50 MiB) in memory, never the file.

**Parts must be sent in order** (1, 2, ...). That is what makes the sha256
check exact without re-reading the object: the server folds each part into a
running SHA-256 (its state is saved with the part), so `complete` knows the
digest of the whole file. Retrying a part is safe: an identical part is a
no-op, and the last part may be replaced. `complete` answers 400 (and aborts
the upload) if the parts do not add up to the declared `size` or if the
supplied `sha256` differs; the returned `sha256` is always the server's.

Through nginx, `/api/files/uploads/` allows `client_max_body_size 64m` with
`proxy_request_buffering off` and 600 s timeouts (see `nginx.conf`, and
`caprover/pyracms-nginx.ejs` in pyracms-deploy); every other route keeps its
small limit. Drogon has a single global body cap, so it is set to the larger
of `MAX_UPLOAD_MB` and one part and the backend rejects bigger bodies on all
other routes itself.

### Downloads of big files

The object store cannot serve byte ranges, and the HTTP client would buffer a
whole 1 GB body. Stored files of at least `STREAM_MIN_MB` are therefore piped
with libcurl in a worker thread through a bounded queue (a few MiB in RAM,
which also paces the fetch to the client). `Range` (206/416), `If-Range`,
`ETag`/304 and `Accept-Ranges` behave as before; because the store has no
range support a ranged request reads and discards the bytes before `start`
(fast on the LAN, but the cost grows with the offset). Adding `Range` to the
store would remove that.

## Security notes

* No public bucket: the store only answers requests carrying the API key and
  is not published in production (data network only); browsers never talk to
  it, every download goes through the backend, which applies file/page
  visibility rules first.
* Keys are per tenant (`tenant-<siteId>-<uuid>`, uuid server-made), never
  built from a client filename; the multipart id from the store is validated
  before it is put in a URL.
* Least privilege: give PyraCMS its own API key (`objectstore-init`), remove
  the store's seed key (`OBJECTSTORE_REMOVE_SEED=1`, forced in production)
  and use no other client with it. Rotate by re-running `objectstore-init`.
* Uploaded files are always served as downloads with a fixed safe type.

## The bundled object store

`docker-compose.yml`, `docker-compose.ghcr.yml` and `docker-compose.prod.yml`
start it by default (no profile needed):

* `objectstore`: `ghcr.io/johndoe6345789/object-store`, pinned by digest,
  port 9000, blob volume `objectstore_data`, healthcheck on `/health`.
  Dev publishes it on `127.0.0.1:9099`; production publishes nothing (data
  network only).
* `objectstore-db`: one-shot; creates the `objectstore` database in the
  existing `postgres` container.
* `objectstore-init`: one-shot; inserts PyraCMS's API key
  (`scripts/objectstore-init.sh`). The store ships a seed key
  `minioadmin/minioadmin`; with `OBJECTSTORE_REMOVE_SEED=1` (forced in
  production) it is deleted.

```bash
# dev: throwaway keys pyracms-dev / pyracms-dev-secret
docker compose up -d
# dev only, no object store needed: STORAGE_BACKEND=local docker compose up -d

# production: keys come from gen-env.sh (it also sets OBJECTSTORE_REMOVE_SEED=1)
./scripts/gen-env.sh > .env.prod && chmod 600 .env.prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.prod -p pyracms-prod up -d --build
```

The backend starts without waiting for the store; uploads return `503`/`502`
for the few seconds until `objectstore-init` has finished. Buckets are owned
by the API key that creates them, so keep using the same key (rotate by
re-running `objectstore-init` with the same access key and a new secret).
You can also use your own store: set `S3_ENDPOINT` and the keys.

## Migrating local files to the object store

`cli.py migrate-storage` (in `pyracms-cpp-port`) moves every `files` row
with `storage='local'`: it reads the file from the uploads dir, checks size
and sha256 against the row, uploads it (multipart above 64 MiB) as
`tenant-<siteId>-<uuid>` (plus its thumbnail), reads it back and verifies it,
and only then sets `storage='s3'`. With `--delete-local` the local file is
removed after that verified read-back. `--dry-run` changes nothing; re-runs
skip rows already migrated; the exit status is non-zero if any file failed.

Settings come from the backend's own variables (`DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `S3_ENDPOINT`, `S3_BUCKET`,
`S3_ACCESS_KEY`, `S3_SECRET_KEY`); the uploads dir is `--uploads-dir` or
`UPLOAD_DIR` (default `/app/uploads`). It needs `python3` and `psql` and
must reach both the database and the store, e.g. from a throwaway container
on the deployment's docker network that mounts the uploads volume read-write:

```bash
docker run --rm --network <data-network> -v <project>_uploads_data:/app/uploads \
  -v "$PWD":/w -w /w -e DB_HOST=... -e DB_PASSWORD=... -e S3_ENDPOINT=... \
  -e S3_ACCESS_KEY=... -e S3_SECRET_KEY=... python:3-slim sh -c \
  'apt-get update -qq && apt-get install -y -qq postgresql-client >/dev/null &&
   python3 cli.py migrate-storage --dry-run'
```

Run it with `--dry-run` first, then without, then (after checking downloads)
once more with `--delete-local`. `scripts/storage-migrate-to-s3.sh` is the
older shell version (no read-back verification).

## Backups

The database dump (`scripts/backup.sh`) covers metadata only. Blobs need their
own backup:

* `local` (dev, or files not yet migrated): the `uploads_data` volume (the `backup` profile already archives it).
* `s3` with the bundled store (production): the object store keeps blob bytes in
  `objectstore_data` and their index in the `objectstore` database. Back up
  **both together**:

  ```bash
  docker compose exec -T postgres pg_dump -U pyracms -Fc objectstore > objectstore-db.dump
  docker run --rm -v pyracms-prod_objectstore_data:/d:ro -v "$PWD":/b alpine \
    tar -C /d -czf /b/objectstore-blobs.tar.gz .
  ```

  A blob without its row (or the reverse) is unreachable. With your own store,
  use its own backup mechanism.
