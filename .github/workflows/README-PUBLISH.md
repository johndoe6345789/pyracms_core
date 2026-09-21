# Publishing

## Docker images (`docker-multiarch.yml`)

Builds `pyracms-cpp-port/backend` and `pyracms-cpp-port/frontend` for
`linux/amd64` (ubuntu-24.04) and `linux/arm64` (ubuntu-24.04-arm), natively,
with no QEMU. Per-arch digests are merged into one multi-arch manifest.

- `ghcr.io/johndoe6345789/pyracms-backend`
- `ghcr.io/johndoe6345789/pyracms-frontend`

Tags: `latest` (master), `sha-<short>`, and `X.Y.Z` / `X.Y` on `v*` tags.
Every push to master publishes (no path filter; a runs-on-every-commit build
is the price of `latest` never lagging). Pull requests build only (no login,
no push), and only when the images' inputs change. The same holds for the
sandbox images (`runner-images.yml`). Auth is `GITHUB_TOKEN` with
`packages: write` on the build/merge jobs. `linux/arm/v7` is not built: the
Conan dependency set has no reliable armv7 support.

## Release bundle (`publish-release.yml`)

On `v*` tags (or manual dispatch with an existing tag) attaches
`pyracms-compose-<tag>.tar.gz` / `.zip` / `.sha256` to the GitHub Release:
`docker-compose.yml`, `docker-compose.ghcr.yml`, `nginx.conf` and `sql/`.
Run it with:

```bash
docker compose -f docker-compose.ghcr.yml up -d   # PYRACMS_VERSION=1.2.3
```

`pyracms-cpp-port/docker-compose.ghcr.yml` uses the GHCR images instead of
building. `launcher-build.yml` separately attaches the Hypernucleus launcher
(Windows/macOS/Linux x amd64/arm64) to the same release.

## The rolling `edge` pre-release

Every push to master moves the `edge` tag to that commit and refreshes its
assets: the Hypernucleus launcher and games (`launcher-build.yml`, only when
every build job succeeded) and the compose bundle pinned to the `latest`
images (`publish-release.yml`). The two workflows share the release through
`.github/scripts/edge-release.sh` and only delete their own stale assets.
It is a pre-release with a moving tag, never a versioned one: the download
page only considers `v*` / `launcher-v*` tags and the launcher's update check
uses `/releases/latest`, so neither ever picks `edge`. `edge` is not
registered with the GameDep API; only tags (or a manual publish) are.

## Cutting a release

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

Packages must allow the repo's Actions access (Package settings) if a
package already exists under a different owner/repo link.
