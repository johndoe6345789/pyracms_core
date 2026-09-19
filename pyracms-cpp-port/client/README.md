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
| Dependencies | Recursive resolution. **pip first**: a dependency name found on PyPI is installed with `pip install --target <data>/pylibs/<game>`; names that are not on pip are downloaded as PyraCMS dependency modules. `requirements` / `pip` fields of the manifest and a `requirements.txt` inside the game archive are honoured too |
| Launching | Python games exactly like the original client (module on `sys.path`, deps + pip folder on `PYTHONPATH`, cwd = game folder, `main()` called); native builds via the per-OS executable; output captured to `logs/<game>.log` and shown in the UI |
| Accounts | `POST /api/auth/login` with `{username, password, tenant}`; token from the response (it carries the tenant id; catalog and download calls are not tenant-scoped server side yet) |
| Links | `pyracms://launch/<slug>/<name>` and `pyracms://install/<slug>/<name>`, single instance via QLocalServer / QLocalSocket |
| Keyboard | Ctrl+F search, Ctrl+1 / Ctrl+2 tabs, Ctrl+R / F5 refresh, Ctrl+, settings, arrows + Enter in lists, Esc back |

## Build

Requirements: CMake >= 3.21, a C++17 compiler, Qt 6.4+ (Core, Gui, Network,
Qml, Quick, QuickControls2) and QuaZip for Qt 6.

```sh
# with conan (Qt 6.7.3 + QuaZip, see conanfile.txt)
conan install . --output-folder=build --build=missing
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake
cmake --build build

# or with system packages (Ubuntu 24.04)
sudo apt install qt6-base-dev qt6-declarative-dev libquazip1-qt6-dev \
     qml6-module-qtquick-controls qml6-module-qtquick-layouts ninja-build
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
<data dir>/pylibs/<game>         pip --target folder of one game
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

* `GET /api/outputs/json` - catalog `{games: [...], deps: [...]}`
  (fallback: `GET /api/gamedep/{game|dep}?limit=200`)
* `GET /api/gamedep/{type}/{name}` - page detail
* `GET /api/files/{uuid-or-id}` - archives, screenshots
* `POST /api/auth/login`, `POST /api/auth/register` (with `tenant`)

Optional fields the launcher reads when present (the current backend does
not return all of them yet): `tags`, `screenshots` / `pictures`,
`dependencies: [{name, version, source}]`, `requirements` / `pip`,
revision `binaries: [{os, arch, fileId|url, size, sha256, executable}]`,
`sha256` and `size` on revisions.

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

## Known gaps

* The backend's page/catalog responses do not yet include binaries,
  dependencies, tags, screenshots, sizes or checksums; until they do the
  launcher shows and installs what is available (source archive only, no
  dependency graph, no verification data).
* No managed Python download: a Python interpreter must be installed (or
  placed in `<data dir>/python`, or set in Settings). pip packages go to a
  per-game `--target` folder, not a venv.
* The login token is kept in `QSettings` (plain text).
* Uninstall does not remove orphaned dependency modules.
* Translations (`translations/*.ts`) are not wired into the new UI text.
