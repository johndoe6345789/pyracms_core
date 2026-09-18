#include "domain/CatalogParser.h"

#include <QJsonValue>
#include <algorithm>

namespace Hypernucleus {
namespace CatalogParser {

QString normalizeType(const QString& type)
{
    const QString t = type.trimmed().toLower();
    if (t == "dep" || t == "dependency" || t == "deps" || t == "dependencies")
        return QStringLiteral("dep");
    return QStringLiteral("game");
}

} // namespace CatalogParser
} // namespace Hypernucleus
