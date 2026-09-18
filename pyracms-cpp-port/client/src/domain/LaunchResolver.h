#pragma once

#include "domain/InstallStateStore.h"

#include <QMap>
#include <QString>
#include <QStringList>

namespace Hypernucleus {
namespace LaunchResolver {

// True if `path` (after cleaning) is `base` or lives below it.
bool isInside(const QString& base, const QString& path);

// Per-OS executable selection for native builds. `hint` is an optional
// path relative to gameDir (from the manifest / binary entry). `os` is one of
// windows | macos | linux. Returns an absolute path or an empty string.
QString findNativeExecutable(const QString& gameDir, const QString& name,
                             const QString& hint, const QString& os);

// PYTHONPATH entries for a python game, mirroring original Hypernucleus:
// module type "file" -> the module's own folder, "folder" -> its parent
// (games/ or dependencies/). Unknown type adds both. Extra entries: the
// per-game pip target directory.
QStringList pythonPathEntries(const InstallRecord& game,
                              const QMap<QString, InstallRecord>& installed,
                              const QString& pipTargetDir);

// Script passed to `python -c`; argv: <module> <workdir> [args...]
QString pythonBootstrapScript();

} // namespace LaunchResolver
} // namespace Hypernucleus
