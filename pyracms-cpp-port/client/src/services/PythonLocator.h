#pragma once

#include <QString>
#include <QStringList>

namespace Hypernucleus {

struct PythonInfo {
    QString exe;        // empty = not found
    QStringList prefix; // extra leading args (e.g. "-3" for the "py" launcher)
    bool found() const { return !exe.isEmpty(); }
};

namespace PythonLocator {

// Search order: explicit setting -> managed interpreter in
// <dataDir>/python -> python3 / python / py on PATH (skipping the Windows
// Store stub in WindowsApps unless nothing else exists).
PythonInfo find(const QString& configuredPath, const QString& dataDir);

// Candidate relative paths of a managed interpreter, for tests and docs.
QStringList managedCandidates();

} // namespace PythonLocator
} // namespace Hypernucleus
