# Hypernucleus (Qt 6 / QML game launcher)

A Steam-like launcher for the games and dependency modules of a PyraCMS
site. It is the Qt 6 successor of the original Python/PyQt5
[hypernucleus_client](https://github.com/johndoe6345789/hypernucleus_client)
and keeps its conventions (see "Compatibility" below).

* UI: Qt Quick + Qt Quick Controls 2 (Material style), QML module
  `Hypernucleus`, dark Steam-like theme with a light option.
* Backend: C++17. Domain/services in `src/domain` + `src/services`
  (static library `hypernucleus_lib`), QML-facing types in `src/models` and
  `src/viewmodels` (`QML_ELEMENT`, `QML_SINGLETON`).

## Features

| Area | What it does |
| --- | --- |
| Library | Sidebar with search (Ctrl+F), filters All / Installed / Updates, categories (tags + Favourites), Installed / Not installed sections |
| Store | Grid of every game of the site; opens the same game page |
| Game page | Hero banner, screenshots, description, tags, version selector, requirements, details, last game output |
| Primary button | Install / Update / Installing 42% / Verifying / Play / Stop / Launch failed - Retry |
| Downloads | Queue, progress, speed, resume (`.part` + HTTP Range), size + sha256 verification when the API publishes them, cancel keeps the partial file |
| Dependencies | Recursive resolution. **pip first**: a dependency name found on PyPI is installed with `pip install` into the game's own **virtual environment** (`<data>/pylibs/<game>/venv`); names that are not on pip are downloaded as PyraCMS dependency modules. `requirements` / `pip` fields of the manifest and a `requirements.txt` inside the game archive are honoured too |
| Launching | Python games exactly like the original client (module on `sys.path`, deps on `PYTHONPATH`, the game's venv interpreter when it has pip packages, cwd = game folder, `main()` called); native builds via the per-OS executable; output captured to `logs/<game>.log` and shown in the UI |
| Connect | No sign-in wall: on first run a small non-blocking "Connect" card asks for a **server** and a **site**. Both are editable dropdowns with autocomplete (see "Servers and sites") |
| Anonymous use | The catalog and public games (archives, dependencies, screenshots) load, install and run **without an account**; no `Authorization` header is sent unless you are signed in |
| Accounts | Optional (top-bar "Sign in", also Create account). `POST /api/auth/login` with `{username, password, tenant}`; the token is only needed for private games and account features. Changing server or site signs you out (a token belongs to one server + site) |
| Links | `pyracms://launch/<slug>/<name>` and `pyracms://install/<slug>/<name>`, single instance via QLocalServer / QLocalSocket |
| Keyboard | Ctrl+F search, Ctrl+1 / Ctrl+2 tabs, Ctrl+R / F5 refresh, Ctrl+, settings, arrows + Enter in lists, Esc back |

## Build

Requirements: CMake >= 3.21, a C++17 compiler, Qt 6.4+ (Core, Gui, Network,
Qml, Quick, QuickControls2, LinguistTools) and QuaZip for Qt 6.

```sh
# with conan (Qt 6.7.3 + QuaZip, see conanfile.txt)
conan install . --output-folder=build --build=missing
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake
cmake --build build

# or with system packages (Ubuntu 24.04); qt6-tools-dev + qt6-l10n-tools
# provide Qt6LinguistTools (lrelease compiles translations/*.ts)
sudo apt install qt6-base-dev qt6-declarative-dev libquazip1-qt6-dev \
     qml6-module-qtquick-controls qml6-module-qtquick-layouts ninja-build \n     qt6-tools-dev qt6-l10n-tools
cmake -S . -B build -G Ninja && cmake --build build
./build/hypernucleus
```

`CMakeLists.txt` and `tests/CMakeLists.txt` are generated from
`cmake_templates/*.j2` by `python generate_cmake.py` (needs `jinja2`) - run
it after adding or removing files.

## Tests

```sh
cmake -S . -B build -DBUILD_GTEST_TESTS=OFF   # QtTest only, no network
cmake --build build && ctest --test-dir build
# coverage (gcovr)
cmake -S . -B cov -DENABLE_COVERAGE=ON && cmake --build cov
ctest --test-dir cov && gcovr -r . --filter src/ cov
```

QtTest suites live in `tests/qt` (one executable each); `qtst_Ui*` suites
also link the models / view-models. The original GoogleTest suites are in
`tests/` (`BUILD_GTEST_TESTS`, fetches googletest when it is not installed).

## Servers and sites

* **Server** dropdown: presets `http://localhost:3199` (the local Docker
  stack, i.e. the nginx proxy - not the raw backend port 8080) and
  `https://pyracms.pynguins.xyz`, followed by servers you used before
  (persisted in the settings as `recentServers`, newest first, deduplicated,
  at most 8). Typing filters the list; any `http(s)://host[:port]` address
  is accepted, anything else is rejected with a hint.
* **Site** dropdown: filled from the chosen server's public
  `GET /api/tenants` (sent without the token), shown as
  `Display Name (slug)`; refreshed whenever the server changes. When the
  server is unreachable a message says so and you can still type a slug.
* The same two dropdowns are used by the Connect card, Sign in, Create
  account and Settings -> General.
* Catalog of a site: `GET /api/tenants/<slug>` (tenant id), then
  `GET /api/gamedep/catalog?tenant_id=<id>` (fallbacks:
  `/api/outputs/json?tenant_id=<id>`, then the per-type listings).
* Private games: when a download answers 401/403 the launcher says "This
  game is private - sign in to install." (signed-in users: "You do not have
  access to this game."). Error pages are never stored as archive data.

## `pyracms://` links

The launcher is a single instance per user: opening a link while it runs
hands the URL to the running window.

* `launch/<slug>/<name>` starts an installed game of the current site
  without asking; otherwise (not installed / other site) a confirmation
  dialog appears.
* `install/<slug>/<name>` always asks first ("only continue if you trust
  the website"). A link for another site asks to switch site and signs the
  current account out (accounts are per tenant).
* Slugs and names are validated (no separators, `..`, control characters).

Register the scheme for the current user (Settings -> Links has a button
that does this for you on Windows and Linux):

**Windows** (`reg add`, no admin rights)

```bat
reg add "HKCU\Software\Classes\pyracms" /ve /d "URL:PyraCMS Protocol" /f
reg add "HKCU\Software\Classes\pyracms" /v "URL Protocol" /d "" /f
reg add "HKCU\Software\Classes\pyracms\shell\open\command" /ve ^
    /d "\"C:\Path\To\hypernucleus.exe\" \"%1\"" /f
```

**Linux** - `~/.local/share/applications/hypernucleus-url.desktop`

```ini
[Desktop Entry]
Type=Application
Name=Hypernucleus
Exec=/path/to/hypernucleus %u
NoDisplay=true
MimeType=x-scheme-handler/pyracms;
```

then `xdg-mime default hypernucleus-url.desktop x-scheme-handler/pyracms`.

**macOS** - add to the app bundle's `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array><dict>
  <key>CFBundleURLName</key><string>PyraCMS</string>
  <key>CFBundleURLSchemes</key><array><string>pyracms</string></array>
</dict></array>
```

Try it: `xdg-open "pyracms://launch/my-site/my-game"` /
`start pyracms://install/my-site/my-game` / `open pyracms://...`.

## Data layout and compatibility with the original client

```
<data dir>/games/<name>          extracted game (no version sub-folder)
<data dir>/dependencies/<name>   extracted dependency module
<data dir>/pylibs/<game>/venv    virtual environment of one game (pip packages)
<data dir>/python                managed Python (python-build-standalone)
<data dir>/archives, pictures    downloads in progress, cached art
<config dir>/installed.json      what is installed (versions, paths, deps)
<config dir>/logs/<game>.log     game output
```

Default folder: `~/.config/hypernucleus`, `~/Library/Application
Support/hypernucleus`, `%APPDATA%\hypernucleus\hypernucleus` - the same as
the original client. On first start the `[Installed Version]` section of an
old `config.ini` is imported. The install folder can be changed in
Settings (existing installs keep working: paths are stored per install).

Manifest handling follows the original: archives contain a top-level folder
named like the module; `moduletype` `file` puts the module folder itself
on `sys.path`, `folder` its parent; dependencies may offer per-OS/arch
binaries with `pi`/`pi` meaning platform independent. Both the PyraCMS API
spelling (`displayName`, `fileId`, `moduleType`) and the original manifest
(`display_name`, `source_uuid`, `moduletype`, `gamedep: [{game: ..}]`) are
parsed.

## Server side data the launcher uses

* `GET /api/tenants`, `GET /api/tenants/{slug}` - sites (public)
* `GET /api/gamedep/catalog?tenant_id=<id>` - catalog of one site, also
  `GET /api/outputs/json` `{games: [...], deps: [...]}` (fallback:
  `GET /api/gamedep/{game|dep}?limit=200`)
* `GET /api/gamedep/{type}/{name}` - page detail
* `GET /api/files/{uuid-or-id}` - archives, screenshots; anonymous access
  works for files of published public games, other files answer 401/403/404
* `POST /api/auth/login`, `POST /api/auth/register` (with `tenant`)

The backend delivers everything the launcher uses, per game and revision:
`tags`, `screenshots` (`url`, `thumbnail`, `default`), `owner` /
`ownerUsername`, `downloadCount`, `dependencies` (`name`, `version` with its
operator such as `==2.6.1`, `kind` = `pip` | `pyracms`), `pipRequirements`,
and per revision `binaries` (`os`, `arch`, `fileId` / `uuid`, `url`, `size`,
`sha256`, `executable`) plus `sha256` / `size` of the source archive. The
tests in `tests/qt/qtst_Backend*.cpp` parse fixtures captured from the live
stack (`tests/fixtures`). Build selection: an exact OS + architecture match
wins; Windows arm64 runs the x86_64 build (emulation) and macOS arm64 the
x86_64 build (Rosetta 2) only when the revision has no arm64 build; `pi` /
`pi` (platform independent) and the Python source archive are the fallbacks.
The detail page shows the download size of the build for this machine, the
publisher, the download count, tags and screenshots.

## Releases and download URLs

The workflow `.github/workflows/launcher-build.yml` builds the launcher and
the Python games on GitHub Actions (Windows, macOS, Linux; x86_64 and arm64)
and attaches them to a GitHub Release when a `launcher-v*` or `v*` tag is
pushed (`launcher-v0.x` are marked pre-release). Assets have stable names:

| Asset | Contents |
| --- | --- |
| `hypernucleus-<os>-<arch>.zip` | Windows (`win`) and macOS (`mac`) archive |
| `hypernucleus-<os>-<arch>.dmg` | macOS disk image |
| `hypernucleus-<os>-<arch>.AppImage` / `.tar.gz` | Linux (`lin`) |
| `<game>-<os>-<arch>[.exe|.zip]` | standalone Python game |
| `*.manifest.json`, `catalog.json` | per-file manifests and merged catalogue |
| `SHA256SUMS` | checksums of all binaries |

`<os>` is `win`, `mac` or `lin`; `<arch>` is `x86_64` or `arm64`. Latest
launcher: `GET https://api.github.com/repos/johndoe6345789/pyracms_core/releases`
(pick the newest `launcher-v*` release) and match asset names above; direct
link: `https://github.com/johndoe6345789/pyracms_core/releases/download/<tag>/hypernucleus-lin-x86_64.AppImage`.
Builds are unsigned (SmartScreen / Gatekeeper warn). Windows arm64 is
experimental. Set `HYPERNUCLEUS_HOME` to keep all launcher data in one folder
(portable mode; the test suites use it too).

## Managed Python and virtual environments

* When a game needs Python (pip packages, or a Python game) and none is
  found (Settings path, `<data dir>/python`, then `python3` / `python` /
  `py` on `PATH`), Hypernucleus asks before it downloads one: "Download
  Python 3.12.x (46 MB)?". The interpreter is the newest cpython 3.12
  `install_only` build of
  [python-build-standalone](https://github.com/astral-sh/python-build-standalone)
  for this OS / architecture (release list from the GitHub API), verified
  against the release's `SHA256SUMS`, unpacked with the system `tar` (bsdtar
  ships with Windows 10+, macOS and Linux; `.zip` assets use QuaZip) into
  `<data dir>/python`. Progress shows in the download bar; afterwards the
  install (or launch) that needed it is repeated.
* pip packages of a game go into `<data dir>/pylibs/<game>/venv`
  (`python -m venv`, then `pip install`); the game runs with that venv's
  interpreter. Old `--target` folders are cleaned up when the venv is made
  (a not yet migrated one is still on `PYTHONPATH` at launch).
* Uninstalling a game removes its venv and every dependency module that no
  other installed game needs (reference counted through the `deps` recorded
  in `installed.json`; a module shared by two games stays until the last one
  goes).

## Login token

The token lives in the OS keychain through the `SecretStore` interface:
Windows Credential Manager (`CredWrite/Read/DeleteW`, Advapi32), macOS
Keychain (`SecItem*`, Security.framework) and, on Linux, the Secret Service
via libsecret's `secret-tool` (package `libsecret-tools`). Without a working
keychain the token is kept in memory for the session and the launcher says
so; it is never written to disk in plain text. A plaintext `auth/token` left
by an older version is moved into the keychain once and deleted. Portable
mode (`HYPERNUCLEUS_HOME`) uses the session-only store.

## Languages

`translations/hypernucleus_{en,es,fr}.ts` are compiled to `.qm` by lrelease
(`qt_add_lupdate` / `qt_add_lrelease`, embedded under `:/translations`);
`ninja hypernucleus_lupdate` refreshes the `.ts` files from the sources
(QML `qsTr`, C++ `tr` / `HnText::tr`). Settings has a **Language** selector
(System default / English / Español / Français) that applies at once
(`engine.retranslate()`); the choice is saved. Developer switches:
`hypernucleus --lang es --screenshot out.png` runs one session in a language
and saves the window as PNG (used by the tests).

## Remaining limitations

* The seeded demo games publish no files at all (no source archive, no
  binaries), so installing them from the demo site fails with "No file UUID
  in revision data" until a game is published with a build.
* Managed Python is only offered for x86_64 / arm64 on Windows, macOS and
  Linux (glibc); other CPUs need an interpreter from `PATH` or Settings.
* Venvs are not rebuilt when the interpreter they were made with disappears
  or is upgraded: reinstall the game.
* Builds are unsigned (SmartScreen / Gatekeeper warnings).
