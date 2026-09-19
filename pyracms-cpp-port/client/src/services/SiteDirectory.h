#pragma once

#include "domain/TenantInfo.h"

#include <QObject>
#include <QString>
#include <QVariantList>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

class ApiClient;

// Sites (tenants) offered by a server, from the public GET /api/tenants.
// Requests never carry the login token: the server is whatever the user
// typed, and the list is public anyway.
class SiteDirectory : public QObject {
    Q_OBJECT
    QML_ANONYMOUS
    Q_PROPERTY(QVariantList sites READ sites NOTIFY changed)
    Q_PROPERTY(QString status READ status NOTIFY changed)
    Q_PROPERTY(bool loading READ loading NOTIFY changed)

public:
    explicit SiteDirectory(ApiClient* api, QObject* parent = nullptr);

    QVariantList sites() const;
    QString status() const { return m_status; }
    bool loading() const { return m_loading; }

    // Replaces the list; a newer call supersedes an older one in flight.
    Q_INVOKABLE void load(const QString& serverUrl);

signals:
    void changed();

private:
    void finish(int generation, const QList<TenantInfo>& sites,
                const QString& status);

    ApiClient* m_api;
    QList<TenantInfo> m_sites;
    QString m_status;
    bool m_loading = false;
    int m_generation = 0;
};

} // namespace Hypernucleus
