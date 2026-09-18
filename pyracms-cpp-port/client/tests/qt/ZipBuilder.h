#pragma once

#include <QByteArray>
#include <QFile>
#include <QMap>
#include <QString>

#include <quazip/quazip.h>
#include <quazip/quazipfile.h>

// Builds a zip in memory-free fashion for tests.
// entries: archive path -> content. Paths ending in ".sh" get mode 0755.
inline bool buildZip(const QString& zipPath,
                     const QMap<QString, QByteArray>& entries)
{
    QuaZip zip(zipPath);
    if (!zip.open(QuaZip::mdCreate)) return false;
    for (auto it = entries.cbegin(); it != entries.cend(); ++it) {
        QuaZipNewInfo info(it.key());
        if (it.key().endsWith(".sh")) info.externalAttr = 0100755u << 16;
        QuaZipFile out(&zip);
        if (!out.open(QIODevice::WriteOnly, info)) return false;
        out.write(it.value());
        out.close();
    }
    zip.close();
    return zip.getZipError() == 0;
}

inline QByteArray readAll(const QString& path)
{
    QFile f(path);
    return f.open(QIODevice::ReadOnly) ? f.readAll() : QByteArray();
}
