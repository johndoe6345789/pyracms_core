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
    if (!f.open(QIODevice::ReadOnly)) return false;
    const QByteArray magic = f.read(4);
    return magic.startsWith("PK\x03\x04") || magic.startsWith("PK\x05\x06");
}

} // namespace ArchiveExtractor
} // namespace Hypernucleus
