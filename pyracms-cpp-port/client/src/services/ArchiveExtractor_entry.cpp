#include "services/ArchiveEntry.h"
#include "domain/HnText.h"

#include <QDir>
#include <QFile>
#include <QFileInfo>

namespace Hypernucleus {
namespace ArchiveExtractor {

bool copyCurrentEntry(QuaZip& zip, QuaZipFile& zipFile,
                      const QString& entryName, const QString& outputPath,
                      ExtractResult& res)
{
    QDir().mkpath(QFileInfo(outputPath).absolutePath());
    if (!zipFile.open(QIODevice::ReadOnly)) {
        res.error =
            HnText::tr("Failed to read archive entry: %1").arg(entryName);
        return false;
    }
    QFile out(outputPath);
    if (!out.open(QIODevice::WriteOnly)) {
        zipFile.close();
        res.error = HnText::tr("Failed to write file: %1").arg(outputPath);
        return false;
    }
    constexpr qint64 kChunk = 65536;
    while (!zipFile.atEnd()) {
        const QByteArray chunk = zipFile.read(kChunk);
        if (chunk.isEmpty()) break;
        out.write(chunk);
        res.bytes += chunk.size();
    }
    out.close();
    zipFile.close();

#ifndef Q_OS_WIN
    QuaZipFileInfo64 info;
    if (zip.getCurrentFileInfo(&info)) {
        const quint32 unixPerms = (info.externalAttr >> 16) & 0xFFFF;
        if (unixPerms & 0111) {
            out.setPermissions(out.permissions() | QFile::ExeOwner |
                               QFile::ExeGroup | QFile::ExeOther);
        }
    }
#else
    Q_UNUSED(zip)
#endif
    return true;
}

} // namespace ArchiveExtractor
} // namespace Hypernucleus
