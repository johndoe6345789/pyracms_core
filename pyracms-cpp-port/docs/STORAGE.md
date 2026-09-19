# Uploaded-file storage

PyraCMS keeps the bytes of every uploaded file (gallery pictures, admin files,
game and dependency binaries, avatars) in one pluggable store. The file's
metadata (name, type, size, sha256, owner, site) always stays in PostgreSQL.

| Backend | Where the bytes live | Use it when |
|---|---|---|
| `local` (default) | `uploads_data` volume, `/app/uploads/<uuid>` | one host, simplest |
| `s3` | an S3-compatible object store, `tenant-<siteId>-<uuid>` | you want blobs off the app host, or already run one |

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
| `STORAGE_BACKEND` | `local` | `local` or `s3`; anything else refuses to start |
| `S3_ENDPOINT` | | e.g. `http://objectstore:9000` (an optional path prefix is kept) |
| `S3_BUCKET` | `pyracms` | 3-63 chars of `a-z 0-9 - .`; created on first use |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | | the store's API key; **required in production** |
| `S3_TIMEOUT_S` | `60` | per-request timeout |

The backend refuses to start when `STORAGE_BACKEND=s3` lacks `S3_ENDPOINT`,
or, with `PYRACMS_ENV=production`, lacks either key.

Every file row records its backend in a `storage` column (`local` or `s3`,
added idempotently by `sql/070_file_storage.sql`; existing rows are `local`).
New uploads go to `STORAGE_BACKEND`; existing files are read from wherever
their row says, so **switching the backend never breaks old files** as long as
both stores stay reachable (keep the `uploads_data` volume mounted).

Failures are mapped without leaking internals: store unreachable or timed out
gives `503`, any other store error (bad key, 5xx) gives `502`, both with a
generic message; details go to the server log. A delete that cannot reach the
store keeps the database row so it can be retried.

## The bundled object store (compose profile `storage`)

`docker-compose.yml`, `docker-compose.ghcr.yml` and `docker-compose.prod.yml`
define, under profile `storage`:

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
STORAGE_BACKEND=s3 docker compose --profile storage up -d

# production: keys come from gen-env.sh (it also sets OBJECTSTORE_REMOVE_SEED=1)
./scripts/gen-env.sh > .env.prod && chmod 600 .env.prod
sed -i 's/^STORAGE_BACKEND=.*/STORAGE_BACKEND=s3/' .env.prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.prod -p pyracms-prod --profile storage up -d --build
```

The backend starts without waiting for the store; uploads return `503`/`502`
for the few seconds until `objectstore-init` has finished. Buckets are owned
by the API key that creates them, so keep using the same key (rotate by
re-running `objectstore-init` with the same access key and a new secret).
You can also use your own store: set `S3_ENDPOINT`, the keys, and skip the
profile.

## Migrating local files to the object store

1. Start the store and switch new uploads: `STORAGE_BACKEND=s3` (above).
2. Copy the old files and flip their rows, inside the backend container:

   ```bash
   DRY_RUN=1 docker compose exec -T backend sh -s < scripts/storage-migrate-to-s3.sh   # preview
   docker compose exec -T backend sh -s < scripts/storage-migrate-to-s3.sh
   ```

   Each file is copied (plus its thumbnail), then `storage` is set to `s3`.
   It is re-runnable and keeps the local copy. Once you have verified
   downloads, remove old files with the volume (`uploads_data`) when ready.
3. Going back is the same in reverse: set `STORAGE_BACKEND=local`; files whose
   row says `s3` keep being served from the store until you copy them back and
   run `UPDATE files SET storage='local' WHERE uuid = ...`.

## Backups

The database dump (`scripts/backup.sh`) covers metadata only. Blobs need their
own backup:

* `local`: the `uploads_data` volume (the `backup` profile already archives it).
* `s3` with the bundled store: the object store keeps blob bytes in
  `objectstore_data` and their index in the `objectstore` database. Back up
  **both together**:

  ```bash
  docker compose exec -T postgres pg_dump -U pyracms -Fc objectstore > objectstore-db.dump
  docker run --rm -v pyracms-prod_objectstore_data:/d:ro -v "$PWD":/b alpine \
    tar -C /d -czf /b/objectstore-blobs.tar.gz .
  ```

  A blob without its row (or the reverse) is unreachable. With your own store,
  use its own backup mechanism.
