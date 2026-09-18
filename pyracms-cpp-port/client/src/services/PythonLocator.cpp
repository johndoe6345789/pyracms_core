#include "services/PythonLocator.h"

#include <QFileInfo>
#include <QStandardPaths>

namespace Hypernucleus {
namespace PythonLocator {

QStringList managedCandidates()
{
    return {QStringLiteral("python/python.exe"), QStringLiteral("python/bin/python3"),
            QStringLiteral("python/bin/python")};
}

PythonInfo find(const QString& configuredPath, const QString& dataDir)
{
    PythonInfo info;
    if (!configuredPath.trimmed().isEmpty()) {
        const QFileInfo fi(configuredPath.trimmed());
        if (fi.isFile()) {
            info.exe = fi.absoluteFilePath();
            return info;
        }
        const QString onPath = QStandardPaths::findExecutable(configuredPath.trimmed());
        if (!onPath.isEmpty()) {
            info.exe = onPath;
            return info;
        }
    }
    for (const QString& rel : managedCandidates()) {
        const QFileInfo fi(dataDir + "/" + rel);
        if (fi.isFile()) {
            info.exe = fi.absoluteFilePath();
            return info;
        }
    }

    QString storeStub;
    for (const QString& cand : {QStringLiteral("python3"), QStringLiteral("python")}) {
        const QString p = QStandardPaths::findExecutable(cand);
        if (p.isEmpty())
            continue;
        if (p.contains("WindowsApps", Qt::CaseInsensitive)) {
            if (storeStub.isEmpty())
                storeStub = p;
            continue;
        }
        info.exe = p;
        return info;
    }
    const QString launcher = QStandardPaths::findExecutable(QStringLiteral("py"));
    if (!launcher.isEmpty()) {
        info.exe = launcher;
        info.prefix = QStringList{QStringLiteral("-3")};
        return info;
    }
    info.exe = storeStub;
    return info;
}

} // namespace PythonLocator
} // namespace Hypernucleus
