#include "services/ArchiveExtractor.h"
#include "domain/HnText.h"
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
        res.error =
            HnText::tr("Failed to create directory: %1").arg(stagingDir);
        return res;
    }

    QuaZip zip(zipPath);
    if (!zip.open(QuaZip::mdUnzip)) {
        res.error = HnText::tr("Failed to open archive (error %1)")
                        .arg(zip.getZipError());
        return res;
    }

    QuaZipFile zipFile(&zip);
    for (bool more = zip.goToFirstFile(); more; more = zip.goToNextFile()) {
        const QString entryName = zip.getCurrentFileName();
        const QString outputPath =
            QDir::cleanPath(stagingDir + "/" + entryName);
        if (!LaunchResolver::isInside(stagingDir, outputPath)) {
            res.error = HnText::tr("Unsafe path in archive: %1").arg(entryName);
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
