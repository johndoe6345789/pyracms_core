#include "services/ArchiveExtractor.h"
#include "domain/LaunchResolver.h"

#include <QDir>
#include <QDirIterator>
#include <QFile>
#include <QFileInfo>

#include <quazip/quazip.h>
#include <quazip/quazipfile.h>

namespace Hypernucleus {
namespace ArchiveExtractor {

ExtractResult installLayout(const QString& stagingDir, const QString& finalDir,
                            const QString& moduleName)
{
    ExtractResult res;
    QDir final(finalDir);
    if (final.exists() && !final.removeRecursively()) {
        res.error = "Could not replace existing installation: " + finalDir;
        return res;
    }
    QDir().mkpath(QFileInfo(finalDir).absolutePath());

    QString source = stagingDir;
    const QDir staging(stagingDir);
    const QStringList entries = staging.entryList(
        QDir::AllEntries | QDir::NoDotAndDotDot | QDir::Hidden);
    if (entries.size() == 1 && entries.first() == moduleName &&
        QFileInfo(staging.filePath(moduleName)).isDir()) {
        source = staging.filePath(moduleName);
    }

    if (!QDir().rename(source, finalDir)) {
        res.error = "Could not move files into place: " + finalDir;
        return res;
    }
    if (source != stagingDir) QDir(stagingDir).removeRecursively();
    res.ok = true;
    res.bytes = directorySize(finalDir);
    return res;
}

qint64 directorySize(const QString& dir)
{
    qint64 total = 0;
    QDirIterator it(dir, QDir::Files | QDir::Hidden,
                    QDirIterator::Subdirectories);
    while (it.hasNext()) {
        it.next();
        total += it.fileInfo().size();
    }
    return total;
}

} // namespace ArchiveExtractor
} // namespace Hypernucleus
