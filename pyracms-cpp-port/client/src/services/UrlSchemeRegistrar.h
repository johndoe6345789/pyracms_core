#pragma once

#include <QString>

namespace Hypernucleus {
namespace UrlSchemeRegistrar {

// Text of the Linux .desktop entry that claims x-scheme-handler/pyracms.
QString desktopEntry(const QString& exePath);
// Value of the Windows shell\open\command key: "exe" "%1".
QString windowsCommand(const QString& exePath);

// Registers pyracms:// for the current user (no admin rights needed):
//   Windows  HKCU\Software\Classes\pyracms   (via reg.exe)
//   Linux    ~/.local/share/applications/hypernucleus-url.desktop + xdg-mime
//   macOS    not possible at runtime; declared in the app bundle Info.plist
bool registerForCurrentUser(const QString& exePath, QString* error);

} // namespace UrlSchemeRegistrar
} // namespace Hypernucleus
