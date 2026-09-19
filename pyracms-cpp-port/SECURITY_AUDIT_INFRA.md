# Infrastructure / supply-chain security audit

Scope: deployment, infrastructure and supply chain of `pyracms-cpp-port/`
(compose files, Dockerfiles, nginx, GitHub workflows, scripts, git history).
Application code (`backend/src`, `frontend/src`) was out of scope; issues seen
there in passing are listed under "Handed off". Companion: `../SECURITY.md`.

Method: manual review, `gitleaks` over all 261 commits, `trivy config` and
`trivy fs` (vuln + secret) in containers, `docker compose config -q` for all
file combinations, and a live run of both the dev and the production stacks.

Status legend: **Fixed**, **Mitigated** (risk reduced, residual noted),
**Open** (not fixed here), **Info**.

## Summary

| Severity | Found | Fixed | Mitigated | Open |
|----------|------:|------:|----------:|-----:|
| Critical | 2 | 1 | 1 | 0 |
| High     | 11 | 8 | 1 | 2 (app code, handed off: H1, H2) |
| Medium   | 16 | 11 | 0 | 5 (D5, W6, W7, S8, H3) |
| Low      | 7 | 5 | 0 | 2 (W8, S5) |
| Info     | 8 | - | - | - |

Scanner results: gitleaks 0 leaks (261 commits); trivy secret 0; trivy vuln
0 HIGH/CRITICAL in `frontend/package-lock.json` and the games'
`requirements.txt`; trivy config on Dockerfiles: only `--no-install-recommends`
and legacy root-user hits (addressed below).

## Findings

### Compose (docker-compose.yml, docker-compose.ghcr.yml)

| ID | Sev | Finding | Status |
|----|-----|---------|--------|
| C1 | Critical | `/var/run/docker.sock` mounted into a root backend (code runner): root on the host if the backend is compromised. | **Mitigated.** Prod override removes the mount; backend (uid 10001) uses `docker-proxy` (tecnativa socket proxy: containers/images only, no exec/volumes/networks/build/swarm/info; verified `docker run --rm` works and `volume ls`/`info`/`network ls` are 403). Dev keeps the mount deliberately, documented, root-only. **Residual:** the proxy cannot inspect request bodies, so a compromised backend can still create a privileged container. See R1. |
| C2 | Critical | `JWT_SECRET: change-me-in-production` committed in compose (token forgery if deployed as is). | **Fixed** in compose: prod override makes `JWT_SECRET` mandatory (`${JWT_SECRET:?}`, compose refuses to start). Dev uses a clearly named throwaway value. **Open in app code**, see H1. |
| C3 | High | Postgres `pyracms/pyracms` hard-coded; also in backend env. | **Fixed.** Credentials come from `POSTGRES_*` env; prod override requires `POSTGRES_PASSWORD`; `scripts/gen-env.sh` and `.env.prod.example` added. Dev fallback remains (loopback only). |
| C4 | High | Postgres 5499, Redis 6399, Elasticsearch 9299, backend 8099 published on all interfaces (`0.0.0.0`). | **Fixed.** Dev: bound to `127.0.0.1`. Prod: no ports for them at all; only nginx, on `NGINX_BIND` (default loopback). |
| C5 | High | Elasticsearch `xpack.security.enabled=false`, and Redis unauthenticated. | **Mitigated.** Backend has no ES/Redis credential support, so security cannot simply be enabled. In prod both sit on an `internal` network (no ingress/egress; verified postgres has no route out) with no published port. **Open (app):** add ES basic auth / `REDIS_PASSWORD` support, then enable. |
| C6 | High | Backend ran as root; no `read_only`, `cap_drop`, `no-new-privileges`, limits, restart/log policy. | **Fixed** (prod override): all services `cap_drop: ALL` (+ minimal `cap_add` where the image entrypoint needs them), `no-new-privileges`, read-only rootfs + tmpfs (except ES and docker-proxy), memory/cpu/pids limits, log rotation, `restart: unless-stopped`. Dev has `no-new-privileges` on every service. Verified running: backend uid 10001, rootfs read-only, `/app/uploads` writable. |
| C7 | Medium | Images unpinned (`nginx:alpine`, `postgres:15-alpine`, `redis:7-alpine`). | **Fixed.** All pinned as `tag@sha256:` (nginx moved to `1.27-alpine`). Renovate `docker:pinDigests` keeps them current. |
| C8 | Medium | No healthchecks for backend/frontend/nginx. | **Fixed** (image `HEALTHCHECK` for backend/frontend, compose healthcheck for nginx). |
| C9 | Medium | Demo seed (`admin/password123`) runs automatically on every start. | **Fixed.** `SEED_DEV=1` required (entrypoint and `seed.sh` both check); refused when `PYRACMS_ENV=production`; prod override sets `SEED_DEV=0`; ghcr compose defaults to off. |
| C10 | Medium | Single flat network: any service can reach any other. | **Fixed** (prod): `edge`, `data` (internal), `runner-ctl` (internal). |
| C11 | Low | Uploads written to the container filesystem (lost on recreate, forced writable rootfs). | **Fixed.** `uploads_data` named volume. |
| C12 | Info | The in-app remote deploy (DeployButton runs compose through the shared socket) cannot work through the filtered proxy in prod. Intended: production deploys are done out of band. | Info |

### Dockerfiles

| ID | Sev | Finding | Status |
|----|-----|---------|--------|
| D1 | High | `backend/Dockerfile`: root user, unpinned `ubuntu:24.04`, `pip install conan` unpinned, `docker:27-cli` by tag, `seed.sh` shipped active. | **Fixed.** Digest-pinned bases and docker CLI, `conan==2.32.0` (the version already used), `USER 10001`, `HEALTHCHECK`, `--no-install-recommends` and `ca-certificates` in the runtime stage. Builder-stage apt lines intentionally untouched (would bust the ~30 min Conan cache). |
| D2 | High | `frontend/Dockerfile`: root, `npm ci \|\| npm install` (silently falls back to an unlocked install), unpinned base. | **Fixed.** `npm ci` only, `USER node`, digest-pinned, healthcheck. |
| D3 | High | Runner images (execute untrusted code) unpinned; `golang:1.22` and `rust:1.77` are EOL. | **Fixed.** Digest-pinned; Go 1.24 and Rust 1.88 (built and executed a hello world in each under the real `docker run` flags); fixed uid 10001 for `runner`. |
| D4 | Medium | `client/Dockerfile`: root, unpinned `ubuntu:22.04`/conan. | **Fixed.** Digest + `conan==2.11.0` (matches CI), `USER 10001`. Not rebuilt here (Qt/Conan build; needs X11 to run). |
| D5 | Medium | Root `Dockerfile` (legacy Pyramid): `python:3.7.3` (EOL 2023), root, unpinned pip. | **Open.** Legacy, unmaintained; recommend deleting or archiving. Renovate disabled for it. |
| D6 | Low | `.dockerignore` gaps (`.git`, key files, uploads). | **Fixed.** |

### nginx.conf

| ID | Sev | Finding | Status |
|----|-----|---------|--------|
| N1 | Medium | No security headers, version disclosed, `X-Forwarded-For` appended (client-spoofable), no timeouts on slow clients, 50 MB body limit on every path. | **Fixed.** `server_tokens off`; `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Resource-Policy` (each sent once; upstream duplicates hidden); `X-Forwarded-For` overwritten with `$remote_addr`; header/body/send/keepalive timeouts; 1 MB default body, 50 MB only under `/api/`; dotfiles 404; per-IP connection cap. Frontend keeps CSP/HSTS. |
| N2 | Medium | No rate limiting on credential endpoints. | **Fixed.** 20 req/min/IP (burst 10) on `login`, `register`, `forgot-password`, `reset-password`, `verify-email`; 30 r/s on the rest. `/api/auth/me` (session poll) is exempt. Verified 429s. |
| N3 | Low | WebSocket paths `/api/ws/*` had no Upgrade handling. | **Fixed** (upgrade map + long timeouts). |
| N4 | Info | TLS. | `nginx.tls.conf.example` (TLS 1.2/1.3, redirect, HSTS) added; nginx.conf is HTTP-only for use behind CapRover/Traefik/Caddy. Set `set_real_ip_from` when behind a proxy (documented in the file). |
| N5 | Info | Internal ports. | nginx only proxies `backend:8080` and `frontend:3000`; no Postgres/Redis/ES route exists. |

### GitHub workflows

| ID | Sev | Finding | Status |
|----|-----|---------|--------|
| W1 | High | 16 third-party actions referenced by mutable tag (`@v4`, `@v1`...). | **Fixed.** All pinned to full commit SHAs with a `# vX` comment; Renovate `pinGitHubActionDigests` maintains them. |
| W2 | Medium | No SBOM/provenance/vulnerability scanning on image or release workflows. | **Fixed.** BuildKit SBOM and `provenance: mode=max` on pushed images, Trivy scan (SARIF to the Security tab, report-only because the image is already published), `attest-build-provenance` for backend, frontend, runner images, compose bundle and launcher/game release files. New `security.yml`: Trivy misconfig+secret gate (fails on HIGH/CRITICAL), Trivy dependency report, gitleaks over full history, weekly. |
| W3 | Medium | Script-injection review. | **Fixed** (hardened). No `pull_request_target`, no untrusted PR text in `run:`. Two hardening changes: `publish-release.yml` validates the `workflow_dispatch` tag against `^v\d+\.\d+\.\d+...` before it reaches `ref:`/`sed`; `launcher-build.yml` passes version/os/arch to the manifest step through `env:`. Remaining `${{ }}` in `run:` are matrix values or step outputs. |
| W4 | Low | Checkout persisted the token in `.git/config`. | **Fixed** (`persist-credentials: false` everywhere). |
| W5 | Info | Permissions. | Top-level `contents: read` already in all workflows; elevated scopes (`packages`, `id-token`, `attestations`, `security-events`, `contents: write`) only on the jobs that need them. |
| W6 | Medium | `launcher-build.yml` downloads `linuxdeploy` AppImages from the `continuous` release with no checksum. | **Open.** Pin a release and verify its SHA-256. |
| W7 | Medium | Launcher/game binaries are unsigned (Windows/macOS). | **Open.** Attestation added; code signing is still absent. |
| W8 | Low | `bun-version: latest`, `codecov-action` v3 (old major), job-level `HN_API_TOKEN` env visible to every step of the release job. | **Open.** Pin the Bun version; move to codecov v5; scope the token to the publish step. |
| W9 | Info | `renovate.json` was `config:recommended` only. | **Fixed.** Digest pinning for actions and Docker, vulnerability alerts, monthly lockfile maintenance, no automerge for Docker images. Verify the Renovate GitHub App is installed. |
| W10 | Info | `aquasecurity/trivy-action` SHA was resolved from the v0.36.0 tag on the day of writing. | Reviewers should confirm it against the upstream advisories before merging (security tooling is itself a supply-chain target). |

### Scripts, games, secrets

| ID | Sev | Finding | Status |
|----|-----|---------|--------|
| S1 | High | `seed.sh` creates `admin/password123`, `alice/password123` etc.; runs automatically. | **Fixed.** Guarded by `SEED_DEV=1` and never with `PYRACMS_ENV=production`. |
| S2 | Medium | `cli.py db seed` inserts an `admin` user with a known hash. | **Fixed.** Requires `SEED_DEV=1`, refused in production. |
| S3 | Medium | `scripts/seed_games.py` defaults to `password123`. | **Fixed.** Default only when `HN_API_URL` is loopback; any other host needs `HN_API_PASSWORD`/`HN_API_TOKEN`. Existing tests pass. |
| S4 | Low | `.gitignore` did not cover `.env.*`, `*.pem`, `*.key`. | **Fixed** (root and `pyracms-cpp-port`; `.env*.example` kept). |
| S5 | Low | Legacy `production.ini`/`development.ini`: `auth_secret=seekret`, `session_secret=seekret`, `mail.password=changeme`. | **Open.** Placeholders, legacy app only, but a copied `production.ini` would be forgeable. Remove or template them. |
| S6 | Info | Tracked `.env.example` files contain placeholders only; `PLAN.md` documents test credentials; CI Postgres uses `test/test` on an ephemeral service. | Info |
| S7 | Info | Git history. | gitleaks: no findings in 261 commits; no `.env`/`.pem`/`.key` ever added; no private-key or token patterns. No history rewrite needed. |
| S8 | Medium | Conan dependencies use floating ranges (`nlohmann_json/[>=3.11]`, `libcurl/[>=8.0 <9]`, `libpq/[>=15 <17]`) and there is no lockfile; Trivy cannot scan Conan graphs. | **Open.** Generate and commit `conan.lock`. |

## Handed off (application code, not changed)

| ID | Sev | Note |
|----|-----|------|
| H1 | High | `AuthService.cpp` falls back to a hard-coded JWT secret when `JWT_SECRET` is unset. The backend should refuse to start when it is unset or too short (e.g. under 32 bytes). Compose now forces the variable in prod, but a bare `docker run` still boots insecurely. |
| H2 | High | `DockerExecutionService.cpp`: add `--cap-drop=ALL`, `--user 10001`, `--ipc=none`, `--ulimit nproc/nofile`, and stop the container on timeout (`timeout 30 docker run` kills only the CLI; a runner ignoring SIGTERM keeps running). The log message says 10 s but the limit is 30 s. |
| H3 | Medium | Add ES basic-auth and `REDIS_PASSWORD` support so those services can be authenticated (C5). |

## Verification performed

* `docker compose config -q`: `docker-compose.yml`, `docker-compose.ghcr.yml`, and each with `docker-compose.prod.yml`; prod fails with a clear message when `POSTGRES_PASSWORD`/`JWT_SECRET` are missing.
* Dev stack `docker compose up -d --build`: all services healthy, `http://localhost:3199` returns 200, ports bound to `127.0.0.1`, seed still runs (`SEED_DEV=1`), nginx 429s after repeated bad logins, `/api/auth/me` unaffected.
* Prod stack (`-p pyracms-prod`, port 3299): all services healthy; backend uid 10001 with read-only rootfs and writable uploads; no seeding (`admin/password123` rejected); only nginx published; Postgres has no outbound route; code-runner path works via the proxy while volumes/info/networks are denied. Torn down afterwards.
* Runner images: Go and Rust rebuilt and executed.

## Remaining risks

1. **R1 Code runner is not a hard boundary.** Socket proxy limits endpoints, not container options. For anonymous/low-trust "run snippet", run a separate disposable runner host (`DOCKER_HOST` over SSH/mTLS), rootless Docker, Sysbox or gVisor, or disable the feature.
2. Elasticsearch and Redis are unauthenticated and rely on network isolation (C5/H3). Traffic between containers is plain HTTP/TCP.
3. Dev compose is intentionally weak (known creds, root backend + docker.sock, ES open); it is loopback-only but must never be exposed.
4. JWT fallback secret in code (H1) until fixed.
5. Digest pins go stale without Renovate running; Trivy scans of published images are report-only.
6. Launcher binaries unsigned; `linuxdeploy` unpinned (W6/W7); legacy Python app and `.ini` secrets (D5/S5); no Conan lockfile (S8).
7. Not tested here: the actual GitHub Actions runs (YAML validated only), Trivy/attestation steps, and the `client` image build.
