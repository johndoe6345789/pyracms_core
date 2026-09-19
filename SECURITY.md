# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

* Use GitHub's private reporting: **Security -> Report a vulnerability** on
  this repository (preferred), or
* email the maintainer listed on the GitHub profile of `johndoe6345789`.

Include affected version/commit, reproduction steps and impact. You will get
an acknowledgement within 7 days; we aim to ship a fix or mitigation within
90 days and will credit reporters who want it.

Supported: the `master` branch and the latest tagged release of the
`pyracms-cpp-port/` stack (C++ backend, Next.js frontend, launcher, game
catalog). The legacy Python/Pyramid code in the repository root is
unmaintained and EOL (Python 3.7); do not deploy it on the internet.

A full infrastructure/supply-chain review is in
[`pyracms-cpp-port/SECURITY_AUDIT_INFRA.md`](pyracms-cpp-port/SECURITY_AUDIT_INFRA.md).

## Production hardening checklist

`docker-compose.yml` and `docker-compose.ghcr.yml` are **development**
defaults (throwaway credentials, demo data). For production always layer
`docker-compose.prod.yml`:

```sh
cd pyracms-cpp-port
./scripts/gen-env.sh > .env.prod && chmod 600 .env.prod   # random secrets
docker compose -f docker-compose.ghcr.yml -f docker-compose.prod.yml \
  --env-file .env.prod -p pyracms-prod up -d
# (or docker-compose.yml + docker-compose.prod.yml --build to build locally)
```

Full deployment and operations guides (first-run owner, TLS, backups,
upgrades): `pyracms-cpp-port/docs/DEPLOY.md` and `docs/OPERATIONS.md`.
`scripts/smoke.sh <url>` verifies headers, 401s and rate limiting.

Needs Docker Compose >= 2.24. Use a fresh project name/volumes: a database
volume created by the dev stack has the dev password.

Checklist:

- [ ] `.env.prod` has a random `POSTGRES_PASSWORD` and a `JWT_SECRET` of at
      least 48 hex chars; file mode 600; never committed (it is git-ignored).
      The prod override refuses to start if either is missing.
- [ ] The first platform account becomes Platform Owner: create it before
      exposing the site (`scripts/create-owner.sh`, or the guarded
      `ADMIN_*` bootstrap; remove `ADMIN_PASSWORD` afterwards).
- [ ] `SEED_DEV` is **not** set (the override forces `0`). The seed creates
      `admin/password123`. If a demo ever ran on the host, delete that user.
- [ ] Only nginx is published, and only on `127.0.0.1` unless you set
      `NGINX_BIND`. Postgres, Redis, Elasticsearch and the backend have no
      host ports in the prod override. Verify: `docker ps` shows a single
      published port; from another machine `nmap` shows only 22/80/443.
- [ ] TLS is terminated in front of nginx (CapRover / Traefik / Caddy /
      Cloudflare tunnel / `nginx.tls.conf.example`), HTTP redirects to HTTPS,
      HSTS enabled. Behind a proxy set `set_real_ip_from` in `nginx.conf` so
      rate limiting sees real client IPs.
- [ ] Pin images: use `PYRACMS_VERSION=x.y.z` (or `@sha256:` digests) rather
      than `:latest`; verify provenance with
      `gh attestation verify oci://ghcr.io/johndoe6345789/pyracms-backend:x.y.z --owner johndoe6345789`.
- [ ] Code runner: the backend does not mount `docker.sock` in prod; it talks
      to `docker-proxy` (filtered Docker API). This still lets a compromised
      backend start containers, i.e. it is not a hard boundary. Either disable
      "run snippet" (remove `docker-proxy` and `DOCKER_HOST`), or point
      `DOCKER_HOST` at a **separate disposable runner host / rootless Docker /
      Sysbox / gVisor**. Pre-pull runner images from GHCR.
- [ ] Host: unattended security updates, firewall (default deny inbound),
      SSH keys only, non-root Docker user where possible, disk encryption for
      volumes holding uploads and the database, off-host encrypted backups
      (`pg_dump` + `uploads_data`) and a tested restore.
- [ ] Monitoring: watch container health (`docker ps` / healthchecks),
      logs are rotated (10 MB x 5) - ship them off-box; alert on 429/401
      spikes on `/api/auth/*`.
- [ ] GitHub repo: enable secret scanning + push protection, Dependabot/
      Renovate alerts, branch protection on `master`, require review for
      workflow changes, and set the default `GITHUB_TOKEN` permission to
      read-only.

### Proxmox notes

* Prefer a **VM** (not a shared LXC) for the Docker host: a container
  escape from an untrusted-code runner then lands in a guest, not on the
  Proxmox node. If you must use an LXC, use an unprivileged one and do not
  enable `nesting` + `keyctl` on a container that also runs the code runner.
* Give the guest its own VLAN/firewall (Proxmox firewall, default drop);
  allow only 80/443 in and outbound as needed.
* Keep the Proxmox web UI (8006) and SSH off the public internet (VPN /
  Tailscale). Use backups (PBS) with encryption and periodic restore tests.
* Run the code runner on a dedicated small VM if you expose "run snippet" to
  anonymous or low-trust users.

### CapRover notes

* Deploy `frontend`, `backend` and `nginx` as separate CapRover apps or one
  `docker-compose` app; CapRover terminates TLS - enable **Force HTTPS** and
  HTTPS for the app's domain. Do not expose the Postgres/Redis/Elasticsearch
  one-click apps publicly (leave "Expose as web-app" off and do not map host
  ports); reach them over the `srv-captain--*` internal names.
* Put real secrets in the app's environment variables (never in the repo):
  `POSTGRES_PASSWORD`, `DB_PASSWORD`, `JWT_SECRET`. Leave `SEED_DEV` unset.
* CapRover mounts `docker.sock` into its own containers only; do not add it
  to the PyraCMS backend. Use a runner host as described above, or disable
  code snippets.
* Set `set_real_ip_from` to CapRover's network CIDR in `nginx.conf` (or drop
  nginx and let CapRover's nginx route `/api` -> backend, `/` -> frontend
  while keeping the same rate limits).
