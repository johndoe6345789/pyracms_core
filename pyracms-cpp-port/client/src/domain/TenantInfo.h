#pragma once

#include <QJsonDocument>
#include <QList>
#include <QString>
#include <QVariantList>

namespace Hypernucleus {

// One site (tenant) of a PyraCMS server, from the public GET /api/tenants.
struct TenantInfo {
    int id = 0;
    QString slug;
    QString displayName;
    QString description;

    // "Display Name (slug)", or just the slug when there is no better name.
    QString label() const;
};

namespace TenantParser {

// Accepts [{slug, displayName, ...}]; skips entries without a slug.
QList<TenantInfo> parse(const QJsonDocument& doc);
// [{value: slug, label: "Name (slug)", description}] for QML.
QVariantList toChoices(const QList<TenantInfo>& tenants);

} // namespace TenantParser
} // namespace Hypernucleus
