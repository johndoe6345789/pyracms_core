#include "domain/DownloadVerifier.h"

#include <QCryptographicHash>
#include <QFile>
#include <QFileInfo>

namespace Hypernucleus {
namespace DownloadVerifier {

QString normalizeSha(const QString& sha)
{
    QString s = sha.trimmed().toLower();
    if (s.startsWith("sha256:"))
        s = s.mid(7);
    return s;
}

QString sha256File(const QString& path)
{
    QFile f(path);
    if (!f.open(QIODevice::ReadOnly))
        return {};
    QCryptographicHash hash(QCryptographicHash::Sha256);
    if (!hash.addData(&f))
        return {};
    return QString::fromLatin1(hash.result().toHex());
}

VerifyResult verify(const QString& path, qint64 expectedSize,
                    const QString& expectedSha)
{
    VerifyResult r;
    const QFileInfo fi(path);
    if (!fi.exists() || !fi.isFile()) {
        r.error = QStringLiteral("Downloaded file is missing");
        return r;
    }
    if (expectedSize > 0 && fi.size() != expectedSize) {
        r.error = QStringLiteral("Size mismatch: expected %1 bytes, got %2")
                      .arg(expectedSize).arg(fi.size());
        return r;
    }
    const QString want = normalizeSha(expectedSha);
    if (!want.isEmpty()) {
        const QString got = sha256File(path);
        if (got.isEmpty()) {
            r.error = QStringLiteral("Could not read downloaded file");
            return r;
        }
        if (got != want) {
            r.error = QStringLiteral("Checksum mismatch (sha256)");
            return r;
        }
    }
    r.ok = true;
    return r;
}

qint64 resumeOffset(const QString& partPath, qint64 expectedSize)
{
    const QFileInfo fi(partPath);
    if (!fi.exists() || !fi.isFile())
        return 0;
    const qint64 size = fi.size();
    if (size <= 0)
        return 0;
    if (expectedSize > 0 && size > expectedSize)
        return 0;
    return size;
}

} // namespace DownloadVerifier
} // namespace Hypernucleus
