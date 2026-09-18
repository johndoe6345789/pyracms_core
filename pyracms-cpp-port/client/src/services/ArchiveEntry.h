#pragma once

#include "services/ArchiveExtractor.h"

#include <QString>

#include <quazip/quazip.h>
#include <quazip/quazipfile.h>

namespace Hypernucleus {
namespace ArchiveExtractor {

// Copies the archive's current entry to `outputPath` (parents created),
// keeping the executable bit. On failure res.error is set.
bool copyCurrentEntry(QuaZip& zip, QuaZipFile& zipFile,
                      const QString& entryName, const QString& outputPath,
                      ExtractResult& res);

} // namespace ArchiveExtractor
} // namespace Hypernucleus
