#include "domain/CatalogFields.h"

#include <QJsonValue>

namespace Hypernucleus {
namespace CatalogParser {
namespace detail {

QString firstString(const QJsonObject& o,
                    std::initializer_list<const char*> keys)
{
    for (const char* k : keys) {
        const QJsonValue v = o.value(QLatin1String(k));
        if (v.isString() && !v.toString().isEmpty()) return v.toString();
        if (v.isDouble()) return QString::number(v.toDouble(), 'g', 15);
    }
    return {};
}

qint64 firstNumber(const QJsonObject& o,
                   std::initializer_list<const char*> keys)
{
    for (const char* k : keys) {
        const QJsonValue v = o.value(QLatin1String(k));
        if (v.isDouble()) return static_cast<qint64>(v.toDouble());
        if (v.isString()) {
            bool ok = false;
            const qint64 n = v.toString().toLongLong(&ok);
            if (ok) return n;
        }
    }
    return 0;
}

QString cleanSha(const QString& s)
{
    QString t = s.trimmed().toLower();
    if (t.startsWith("sha256:")) t = t.mid(7);
    return t;
}

QString fileRefOf(const QJsonObject& o)
{
    return firstString(o, {"fileUuid", "file_uuid", "source_uuid", "uuid",
                           "fileId", "file_id"});
}

} // namespace detail
} // namespace CatalogParser
} // namespace Hypernucleus
