#include "domain/CatalogFields.h"

#include <QJsonValue>

namespace Hypernucleus {
namespace CatalogParser {
namespace detail {

QList<DepRef> parseDeps(const QJsonArray& arr)
{
    QList<DepRef> deps;
    for (const QJsonValue& v : arr) {
        DepRef d;
        if (v.isObject()) {
            const QJsonObject o = v.toObject();
            d.name = firstString(o, {"dependency", "name", "depName"});
            d.version = firstString(o, {"version", "depVersion"});
            d.source = firstString(o, {"source", "kind"}).toLower();
            if (d.source != "pip" && d.source != "pyracms") d.source.clear();
        } else {
            d.name = v.toString();
        }
        if (!d.name.isEmpty()) deps.append(d);
    }
    return deps;
}

QStringList parsePip(const QJsonObject& o)
{
    QStringList out;
    for (const char* key : {"pip", "requirements", "pipRequirements"}) {
        const QJsonValue v = o.value(QLatin1String(key));
        if (v.isArray()) {
            const QJsonArray arr = v.toArray();
            for (const QJsonValue& e : arr)
                if (!e.toString().trimmed().isEmpty())
                    out.append(e.toString().trimmed());
        } else if (v.isString()) {
            const QStringList lines =
                v.toString().split('\n', Qt::SkipEmptyParts);
            for (const QString& line : lines)
                if (!line.trimmed().isEmpty() &&
                    !line.trimmed().startsWith('#'))
                    out.append(line.trimmed());
        }
    }
    out.removeDuplicates();
    return out;
}

} // namespace detail
} // namespace CatalogParser
} // namespace Hypernucleus
