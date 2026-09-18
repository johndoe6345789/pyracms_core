#include "domain/CatalogFields.h"

#include <QJsonValue>

namespace Hypernucleus {
namespace CatalogParser {
namespace detail {

QStringList parseTags(const QJsonArray& arr)
{
    QStringList tags;
    for (const QJsonValue& v : arr) {
        const QString t =
            v.isObject() ? v.toObject().value("name").toString() : v.toString();
        if (!t.trimmed().isEmpty() && !tags.contains(t.trimmed()))
            tags.append(t.trimmed());
    }
    return tags;
}

QStringList parseShots(const QJsonObject& o, QString* hero)
{
    QStringList shots;
    QJsonArray arr = o.value("screenshots").toArray();
    if (arr.isEmpty()) arr = o.value("pictures").toArray();
    for (const QJsonValue& v : arr) {
        QString ref;
        bool isDefault = false;
        if (v.isObject()) {
            const QJsonObject po = v.toObject();
            ref = firstString(po, {"url", "src", "uuid", "id"});
            isDefault = po.value("default").toBool(false);
        } else {
            ref = v.toString();
        }
        if (ref.isEmpty()) continue;
        shots.append(ref);
        if (isDefault && hero && hero->isEmpty()) *hero = ref;
    }
    return shots;
}

} // namespace detail
} // namespace CatalogParser
} // namespace Hypernucleus
