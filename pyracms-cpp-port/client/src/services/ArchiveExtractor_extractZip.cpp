#include "services/ArchiveExtractor.h"
#include "services/ArchiveEntry.h"
#include "domain/LaunchResolver.h"

#include <QDir>

namespace Hypernucleus {
namespace ArchiveExtractor {

ExtractResult extractZip(const QString& zipPath, const QString& stagingDir)
{
    ExtractResult res;
    QDir staging(stagingDir);
    if (staging.exists()) staging.removeRecursively();
    if (!QDir().mkpath(stagingDir)) {
        res.error = "Failed to create directory: " + stagingDir;
        return res;
    }

    QuaZip zip(zipPath);
    if (!zip.open(QuaZip::mdUnzip)) {
        res.error = "Failed to open archive (error " +
                    QString::number(zip.getZipError()) + ")";
        return res;
    }

    QuaZipFile zipFile(&zip);
    for (bool more = zip.goToFirstFile(); more; more = zip.goToNextFile()) {
        const QString entryName = zip.getCurrentFileName();
        const QString outputPath =
            QDir::cleanPath(stagingDir + "/" + entryName);
        if (!LaunchResolver::isInside(stagingDir, outputPath)) {
            res.error = "Unsafe path in archive: " + entryName;
            break;
        }
        if (entryName.endsWith('/')) {
            QDir().mkpath(outputPath);
            continue;
        }
        if (!copyCurrentEntry(zip, zipFile, entryName, outputPath, res))
            break;
    }
    zip.close();
    res.ok = res.error.isEmpty();
    return res;
}

} // namespace ArchiveExtractor
} // namespace Hypernucleus
