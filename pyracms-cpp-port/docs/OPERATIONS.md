# Operating PyraCMS

Scripts live in `scripts/` and share `scripts/_compose.sh`. They default to
project `pyracms-prod`, env file `.env.prod` and base file
`docker-compose.yml`; override with `PROJECT=`, `ENV_FILE=`,
`BASE_COMPOSE=docker-compose.ghcr.yml`.

| Script | What it does |
|---|---|
| `gen-env.sh` | Print a `.env.prod` with fresh secrets (`SITE_URL`, `NGINX_PORT` honoured). |
| `create-owner.sh` | Create the first Platform Owner; refuses if any platform account exists. |
| `backup.sh` | One-off backup: `pg_dump -Fc` + uploads tarball into `./backups`, rotation. |
| `restore.sh --yes db.dump [uploads.tgz]` | Destructive restore (stops app, restores, restarts). |
| `set-password.sh USER [SITE]` | Reset a lost password without e-mail (hash made on the host, applied inside the Postgres container). |
| `test-mail.sh you@x.com` | Send a test mail with the backend's SMTP settings. |
| `smoke.sh [url]` | Availability, headers, 401, tenant isolation, 429 checks. |

## Backups

What must be saved: the **Postgres database** and the **uploads volume**
(`<project>_uploads_data`). Redis is a cache and Elasticsearch is rebuilt
from the database (search may be stale after a restore).
Keep `.env.prod` in a password manager: without `JWT_SECRET` sessions
invalidate, without `POSTGRES_PASSWORD` you cannot start a restored volume.

* Manual / cron: `./scripts/backup.sh` (`BACKUP_DIR`, `BACKUP_KEEP=14`).
  Cron example: `15 3 * * * cd /opt/pyracms/pyracms-cpp-port && ./scripts/backup.sh >>/var/log/pyracms-backup.log 2>&1`
* Sidecar: `docker compose ... --profile backup up -d backup` runs the same
  logic every `BACKUP_INTERVAL_H` hours (default 24), writing into
  `BACKUP_DIR` (files are root-owned).
* Files: `db-<UTC>.dump` (custom format) and `uploads-<UTC>.tar.gz`; the
  newest `BACKUP_KEEP` of each are kept. Copy them **off the host**
  (rclone/restic/rsync); a backup on the same disk is not a backup.
* **Restore drill** (do it once, on a scratch host):
  `./scripts/restore.sh --yes backups/db-X.dump backups/uploads-X.tar.gz`
  then `./scripts/smoke.sh`. Restore of the DB alone is allowed (omit the
  tarball). The dump is restored with `--clean --if-exists` in a single
  transaction, so a failed restore leaves the previous data intact.
* Before every upgrade run `backup.sh` (migrations have no down step).

## Upgrades

See `docs/DEPLOY.md` section 5. Short form:
`./scripts/backup.sh && git pull` (or bump `PYRACMS_VERSION`), then
`docker compose -f <base> -f docker-compose.prod.yml --env-file .env.prod
-p pyracms-prod pull && ... up -d [--build]`, then `./scripts/smoke.sh`.

## Monitoring and logs

* Liveness `/healthz`, readiness `/readyz`; `docker compose ps` shows
  container health. Alert on `/readyz` != 200 for > 2 min.
* Logs: `docker compose -p pyracms-prod logs -f backend nginx`; json-file
  rotation is 10 MB x 5 per container.
* Disk: watch Docker volumes (`docker system df -v`), backups and the ES
  volume; ES needs free disk (>15 %) or it goes read-only.

## Common tasks

* **Lost owner password**: reset via the mail flow (`test-mail.sh` first).
  If mail is unavailable, run `./scripts/set-password.sh USERNAME [SITE]`
  (no SITE = platform account). It asks for the new password, stores it in
  the backend's hash format, signs out older sessions and spends open reset
  tokens. Against a database you can reach directly, use
  `python cli.py user set-password USERNAME [--tenant SLUG]` (needs `psql`
  and the `DB_*` variables).
* **Rate limited (429)**: limits are per client IP; if everyone shares one
  IP, the real-IP block in `docs/DEPLOY.md` section 4 is missing.
* **Rotate `JWT_SECRET`**: edit `.env.prod`, `up -d`; all users are logged
  out.
* **Rotate DB password**: `ALTER USER` in Postgres, edit `.env.prod`,
  `up -d` (the volume keeps the old password otherwise).
