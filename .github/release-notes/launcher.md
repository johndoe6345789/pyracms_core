## Hypernucleus launcher

Hypernucleus is the PyraCMS desktop launcher (Qt 6 / QML, C++). It browses the
game catalogue of a PyraCMS site, installs games and their dependencies,
verifies downloads, and launches them. Web pages can hand off to it with
`pyracms://` deep links. The Python games published alongside are standalone
binaries (PyInstaller) and are also listed in `catalog.json`.

### Downloads (stable names)

| OS | x86_64 (AMD64) | arm64 |
| --- | --- | --- |
| Windows | `hypernucleus-win-x86_64.zip` | `hypernucleus-win-arm64.zip` (experimental) |
| macOS | `hypernucleus-mac-x86_64.dmg` / `.zip` | `hypernucleus-mac-arm64.dmg` / `.zip` |
| Linux | `hypernucleus-lin-x86_64.AppImage` / `.tar.gz` | `hypernucleus-lin-arm64.AppImage` / `.tar.gz` |

Verify with `SHA256SUMS`. Game binaries are named `<game>-<os>-<arch>`;
`catalog.json` lists every game build with checksums.

### Install

- **Windows**: unzip, run `hypernucleus.exe`.
- **macOS**: open the `.dmg`, drag Hypernucleus to Applications.
- **Linux**: `chmod +x hypernucleus-lin-*.AppImage && ./hypernucleus-lin-*.AppImage`
  (or unpack the `.tar.gz`).

### pyracms:// deep links

`pyracms://launch/<slug>/<game>` and `pyracms://install/<slug>/<game>`
open the launcher on that game. Windows and Linux register the scheme from the
launcher's settings ("Register pyracms:// links"); the macOS app declares it in
its `Info.plist`, so it is active after first launch.

### Unsigned binaries

These builds are not code-signed or notarised yet, so the OS will warn:

- **Windows SmartScreen**: "More info", then "Run anyway".
- **macOS Gatekeeper**: right-click the app, "Open", confirm; or run
  `xattr -dr com.apple.quarantine /Applications/Hypernucleus.app`.
- **Linux**: no warning; the AppImage needs the executable bit.
