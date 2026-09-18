#pragma once

#include <QString>

namespace Hypernucleus {

struct ExtractResult {
    bool ok = false;
    QString error;
    qint64 bytes = 0;
};

namespace ArchiveExtractor {

// Zip magic check ("PK\x03\x04").
bool looksLikeZip(const QString& path);

// Extract into `stagingDir` (created; existing content removed first).
// Entries escaping stagingDir ("zip slip") abort the extraction.
ExtractResult extractZip(const QString& zipPath, const QString& stagingDir);

// Move staged files to `finalDir` (replacing anything there). Layout rule
// from the original Hypernucleus: archives contain a top-level folder named
// like the module. If the staging dir holds exactly that folder, its content
// becomes finalDir; otherwise the whole staging content does.
ExtractResult installLayout(const QString& stagingDir, const QString& finalDir,
                            const QString& moduleName);

// Total size in bytes of all files below `dir`.
qint64 directorySize(const QString& dir);

} // namespace ArchiveExtractor
} // namespace Hypernucleus
