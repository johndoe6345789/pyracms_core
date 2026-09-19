#include "domain/TenantInfo.h"

#include <QJsonArray>
#include <QJsonObject>
#include <QVariantMap>

namespace Hypernucleus {

QString TenantInfo::label() const
{
    if (displayName.isEmpty() || displayName == slug) return slug;
    return QStringLiteral("%1 (%2)").arg(displayName, slug);
}

namespace TenantParser {

QList<TenantInfo> parse(const QJsonDocument& doc)
{
    QList<TenantInfo> out;
    for (const QJsonValue& v : doc.array()) {
        const QJsonObject o = v.toObject();
        TenantInfo t;
        t.slug = o.value("slug").toString().trimmed();
        if (t.slug.isEmpty()) continue;
        t.id = o.value("id").toInt();
        t.displayName = o.value("displayName").toString().trimmed();
        t.description = o.value("description").toString();
        out.append(t);
    }
    return out;
}

QVariantList toChoices(const QList<TenantInfo>& tenants)
{
    QVariantList out;
    for (const TenantInfo& t : tenants)
        out.append(QVariantMap{{"value", t.slug},
                               {"label", t.label()},
                               {"description", t.description}});
    return out;
}

} // namespace TenantParser
} // namespace Hypernucleus
