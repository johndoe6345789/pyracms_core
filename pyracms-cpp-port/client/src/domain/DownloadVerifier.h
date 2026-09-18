#pragma once

#include <QString>

namespace Hypernucleus {

struct VerifyResult {
    bool ok = false;
    QString error;
};

namespace DownloadVerifier {

// Lowercase hex, "sha256:" prefix stripped.
QString normalizeSha(const QString& sha);

// Hex sha256 of a file; empty string if unreadable.
QString sha256File(const QString& path);

// Verify a finished download. expectedSize <= 0 and an empty expectedSha
// skip the respective check, so servers that do not publish them still work.
VerifyResult verify(const QString& path, qint64 expectedSize,
                    const QString& expectedSha);

// How many bytes of an existing partial file can be reused for an HTTP
// Range request. 0 means start over (no file, empty, or larger than the
// expected size which proves it is stale/corrupt).
qint64 resumeOffset(const QString& partPath, qint64 expectedSize);

} // namespace DownloadVerifier
} // namespace Hypernucleus
