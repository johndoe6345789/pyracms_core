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

bool looksLikeZip(const QString& path)
{
    QFile f(path);
    if (!f.open(QIODevice::ReadOnly))
        return false;
    const QByteArray magic = f.read(4);
    return magic.startsWith("PK\x03\x04") || magic.startsWith("PK\x05\x06");
}

ExtractResult extractZip(const QString& zipPath, const QString& stagingDir)
{
    ExtractResult res;
    QDir staging(stagingDir);
    if (staging.exists())
        staging.removeRecursively();
    if (!QDir().mkpath(stagingDir)) {
        res.error = "Failed to create directory: " + stagingDir;
        return res;
    }

    QuaZip zip(zipPath);
    if (!zip.open(QuaZip::mdUnzip)) {
        res.error = "Failed to open archive (error " + QString::number(zip.getZipError()) + ")";
        return res;
    }

    QuaZipFile zipFile(&zip);
    for (bool more = zip.goToFirstFile(); more; more = zip.goToNextFile()) {
        const QString entryName = zip.getCurrentFileName();
        const QString outputPath = QDir::cleanPath(stagingDir + "/" + entryName);

        if (!LaunchResolver::isInside(stagingDir, outputPath)) {
            zip.close();
            res.error = "Unsafe path in archive: " + entryName;
            return res;
        }
        if (entryName.endsWith('/')) {
            QDir().mkpath(outputPath);
            continue;
        }
        QDir().mkpath(QFileInfo(outputPath).absolutePath());

        if (!zipFile.open(QIODevice::ReadOnly)) {
            zip.close();
            res.error = "Failed to read archive entry: " + entryName;
            return res;
        }
        QFile out(outputPath);
        if (!out.open(QIODevice::WriteOnly)) {
            zipFile.close();
            zip.close();
            res.error = "Failed to write file: " + outputPath;
            return res;
        }
        constexpr qint64 kChunk = 65536;
        while (!zipFile.atEnd()) {
            const QByteArray chunk = zipFile.read(kChunk);
            if (chunk.isEmpty())
                break;
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
                out.setPermissions(out.permissions() | QFile::ExeOwner
                                   | QFile::ExeGroup | QFile::ExeOther);
            }
        }
#endif
    }
    zip.close();
    res.ok = true;
    return res;
}

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
    if (entries.size() == 1 && entries.first() == moduleName
        && QFileInfo(staging.filePath(moduleName)).isDir()) {
        source = staging.filePath(moduleName);
    }

    if (!QDir().rename(source, finalDir)) {
        res.error = "Could not move files into place: " + finalDir;
        return res;
    }
    if (source != stagingDir)
        QDir(stagingDir).removeRecursively();
    res.ok = true;
    res.bytes = directorySize(finalDir);
    return res;
}

qint64 directorySize(const QString& dir)
{
    qint64 total = 0;
    QDirIterator it(dir, QDir::Files | QDir::Hidden, QDirIterator::Subdirectories);
    while (it.hasNext()) {
        it.next();
        total += it.fileInfo().size();
    }
    return total;
}

} // namespace ArchiveExtractor
} // namespace Hypernucleus
