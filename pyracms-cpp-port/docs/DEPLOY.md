# Deploying PyraCMS

Targets: a Proxmox VPS/LXC or any Linux host with Docker Compose >= 2.24,
CapRover, or plain `docker compose` behind a reverse proxy. All commands run
from `pyracms-cpp-port/`.

```
internet -> [TLS: Caddy / CapRover / Cloudflare / nginx.tls]
         -> nginx :80 (rate limits, headers, /healthz, /readyz)
             |-> frontend (Next.js, standalone)   /
             '-> backend  (C++ / Drogon)          /api/  /api/ws/
                   |-> postgres, redis, elasticsearch   (internal network)
                   '-> docker-proxy (code runner only)
```

## 1. Quick start

```sh
git clone <repo> && cd pyracms-cpp-port
SITE_URL=https://cms.example.com ./scripts/gen-env.sh > .env.prod
chmod 600 .env.prod
# either build from source ...
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.prod -p pyracms-prod up -d --build
# ... or run prebuilt GHCR images (pin PYRACMS_VERSION in .env.prod)
docker compose -f docker-compose.ghcr.yml -f docker-compose.prod.yml \
  --env-file .env.prod -p pyracms-prod up -d
```

Compose refuses to start when `POSTGRES_PASSWORD` or `JWT_SECRET` is unset.
Use a fresh project name/volumes: an existing dev volume keeps the dev DB
password. nginx listens on `127.0.0.1:${NGINX_PORT:-3199}` only.

## 2. First run: the Platform Owner

Production never seeds demo data (`SEED_DEV=0`, `PYRACMS_ENV=production`;
`admin/password123` cannot exist). The **first account registered on the
platform scope (no `tenant` field) automatically becomes Platform Owner
(SuperAdmin, role 4)**. On a fresh public install anyone reaching
`/auth/register` first would win that race, so claim it before opening the
site to the internet, using one of:

1. **Script (recommended)**, from the host:
   ```sh
   OWNER_USERNAME=owner OWNER_EMAIL=you@example.com ./scripts/create-owner.sh
   ```
   The password is prompted (or `OWNER_PASSWORD`, or stdin). It refuses when
   any platform account already exists, so it cannot hijack a live install.
2. **Env bootstrap**: set `ADMIN_USERNAME` (default `owner`), `ADMIN_EMAIL`,
   `ADMIN_PASSWORD` in `.env.prod`, start the stack, then **delete the three
   lines** and `up -d` again. The backend entrypoint only acts while zero
   platform accounts exist; afterwards it logs "skipping". (The password is
   visible in `docker inspect` while set, hence "remove afterwards".)
3. Bind nginx to loopback (default), register through an SSH tunnel
   (`ssh -L 3199:127.0.0.1:3199 host`), then publish it.

Then: log in at `/auth/login`, open **Super Admin** to see tenants and
users. Other people create their own sites at `/create-site` (any registered
platform user; the creator becomes that site's SiteAdmin). Sites live at
`/site/<slug>`; accounts are per tenant, so a platform login does not work
on a site (verified by `scripts/smoke.sh`).

## 3. Configuration reference

| Variable | Purpose |
|---|---|
| `SITE_URL` | Public origin, no trailing `/`. Feeds `PUBLIC_BASE_URL` (links in e-mails), `CORS_ALLOWED_ORIGINS` (default), `NEXT_PUBLIC_SITE_URL` (sitemap, robots, Open Graph). |
| `CORS_ALLOWED_ORIGINS` | Comma list. Empty backend value means `*`, so prod defaults it to `SITE_URL`. The UI is same-origin and does not need CORS. |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Mail for password reset and verification (section 7). |
| `OAUTH_*` | GitHub/Google/Discord login, in the optional git-ignored `.env.oauth` (not `.env.prod`: the server enables a provider when its variables are merely set). **Always set `OAUTH_<P>_REDIRECT_URI`** (`${SITE_URL}/auth/callback/<provider>`); the built-in default is `localhost:3000`. |
| `JWT_EXPIRY_SECONDS`, `MAX_UPLOAD_MB` | Backend tuning; nginx caps `/api/` bodies at 50 MB. Raise both together. |
| `NGINX_BIND`, `NGINX_PORT` | Host publish address. Keep `127.0.0.1` behind a proxy. |
| `BACKUP_*` | See `OPERATIONS.md`. |
| `STORAGE_BACKEND`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Where uploaded files live: `local` (default) or an S3-compatible object store (compose profile `storage`). See `STORAGE.md`. |

Changing `NEXT_PUBLIC_API_URL` requires a frontend rebuild; leave it empty
(same-origin) unless the API lives on another host.

## 4. Behind a reverse proxy

nginx here is HTTP only. Terminate TLS in front of it.

**Real client IP (required, or the rate limiter sees one IP).** The backend
trusts `X-Forwarded-For` only when the TCP peer is a private address (it is,
inside compose), but nginx *overwrites* that header with the address it sees.
So tell nginx which hops to trust, in `nginx.conf` (top comment block):

```nginx
set_real_ip_from 172.16.0.0/12;   # docker bridge / CapRover overlay
set_real_ip_from 10.0.0.0/8;
real_ip_header   X-Forwarded-For; # Cloudflare: CF-Connecting-IP
real_ip_recursive on;
```
and forward the scheme: `proxy_set_header X-Forwarded-Proto
$http_x_forwarded_proto;` (replace `$scheme`, only when nginx is reachable
solely through the trusted proxy). Without it, HSTS, OAuth redirects and the
Next.js origin see `http`. For Cloudflare also allow-list its published
ranges instead of all of 10/8 if the origin is publicly reachable.

**WebSockets** (collab editing, notifications, `/api/ws/`): the bundled nginx
already upgrades and keeps them open for 1 h. The outer proxy must too:
Caddy and Traefik do it automatically; nginx needs `proxy_set_header Upgrade
$http_upgrade; proxy_set_header Connection "upgrade";`; Cloudflare needs
WebSockets on (default); CapRover: tick "Websocket Support".

**Caddy (simplest TLS + Let's Encrypt)** on the host:
```
cms.example.com {
    reverse_proxy 127.0.0.1:3199
}
```

**Stand-alone nginx TLS with certbot**: copy `nginx.tls.conf.example` to
`nginx.tls.conf`, set `server_name`, obtain certs
(`certbot certonly --standalone -d cms.example.com`), mount
`/etc/letsencrypt/live/<d>/{fullchain,privkey}.pem` at `/etc/nginx/certs/`,
publish `443:443`, set `NGINX_CONF=./nginx.tls.conf`, and reload after
renewal (`docker compose ... exec nginx nginx -s reload` from a certbot
`--deploy-hook`).

**CapRover**: deploy the compose stack on the same Docker host and create
one CapRover app that proxies to `nginx:80` (or use "Deploy via docker
compose" workflow with a captain-definition wrapping the prod files); enable
HTTPS + "Force HTTPS" + WebSocket support, set `SITE_URL` to the app domain,
and apply the real-IP block above with CapRover's overlay subnet.

## 5. Upgrades, rollback, zero downtime

* Migrations (`backend/sql/*.sql`) run on every backend start and are written
  idempotent (`IF NOT EXISTS`, backfills only where missing). There is no
  down-migration: **rollback = redeploy the old image + restore the pre-upgrade
  database backup** (`scripts/backup.sh` first, always).
* Build-from-source: `git pull && docker compose ... up -d --build`.
* GHCR: set `PYRACMS_VERSION=1.2.3` in `.env.prod` (never `latest` in
  production), then
  `docker compose -f docker-compose.ghcr.yml -f docker-compose.prod.yml
  --env-file .env.prod -p pyracms-prod pull && ... up -d`.
  Rollback = set the previous tag, `pull`, `up -d`, restore DB if a migration
  ran.
* Downtime is the backend restart (~10-20 s; nginx answers 502 meanwhile).
  True zero-downtime needs a second backend replica behind nginx and
  backwards-compatible migrations (expand, deploy, contract); not provided.
  Upgrade off-peak. Watch `/readyz` return 200.

## 6. Health, logs, monitoring

* `/healthz` (nginx alive), `/readyz` (backend answers a DB query), plus
  compose healthchecks on every service and log rotation
  (json-file 10 MB x 5). Point Uptime Kuma / your LB at `/readyz`.
* **TODO (backend):** a real `/api/health` reporting DB, Redis and
  Elasticsearch separately does not exist; `/readyz` proxies `/api/tenants`.
  Redis/ES loss degrades features (cache/search) without failing `/readyz`.
* No Prometheus endpoint exists; not part of this stack.

## 7. E-mail

Set `SMTP_*` (port 587 = STARTTLS, 465 = implicit TLS), `up -d`, then
`./scripts/test-mail.sh you@example.com`. Links in mails use `SITE_URL`.
Gmail/Google Workspace needs an app password. Without working SMTP,
password reset and verification mails are not delivered.

## 8. Production checklist

Checked against `docker-compose.yml` + `docker-compose.prod.yml` (verified
on a live `pyracms-prod` project on port 3299, `scripts/smoke.sh` green).

- [x] Secrets generated (`gen-env.sh`), `.env.prod` mode 600, not committed
      (`.env.prod*` is git-ignored). Compose fails without them.
- [x] `SEED_DEV=0`, `PYRACMS_ENV=production` (no `admin/password123`).
- [x] Only nginx published, on `127.0.0.1`; postgres/redis/ES/backend have no
      host ports; data tier on an `internal` network.
- [x] Backend uid 10001, frontend `node`; all services read-only rootfs,
      `cap_drop: ALL`, `no-new-privileges`, mem/cpu/pids limits.
- [x] Images pinned by digest (postgres, redis, ES, nginx, docker-proxy).
- [x] Healthchecks on postgres, redis, ES, backend, frontend, nginx.
- [x] Log rotation on every service.
- [x] Platform Owner created (section 2) *before* exposing the site.
- [x] `SITE_URL`/`CORS_ALLOWED_ORIGINS` set to the public https origin.
- [x] TLS terminated in front; HSTS reaches browsers (backend and Next.js
      both send it when they see https).
- [ ] Real-IP block enabled if behind a proxy (rate limits are per IP).
- [ ] SMTP configured and `test-mail.sh` passes.
- [ ] Backups scheduled (`--profile backup` or cron) **and a restore drill
      done**; copies stored off-host.
- [ ] `PYRACMS_VERSION` pinned (GHCR) and upgrade/rollback read (section 5).
- [ ] Code runner: keep `docker-proxy` only if you need "run snippet" and
      read the residual-risk note in `docker-compose.prod.yml`.
- [ ] Host: firewall allows only 22/80/443, unattended security updates,
      Docker log driver disk usage watched, `vm.max_map_count>=262144`
      for Elasticsearch.
- [ ] `./scripts/smoke.sh https://cms.example.com` passes from outside.

## 9. Known gaps (blocking or to plan)

* No dedicated `/api/health`; no metrics endpoint.
* No down-migrations; single backend instance (no HA).
* Registration is open on the platform scope; there is no built-in
  "invite only" switch.
* Elasticsearch runs without auth on the internal network only.
* Code runner needs Docker daemon access (see `SECURITY_AUDIT_INFRA.md`).
