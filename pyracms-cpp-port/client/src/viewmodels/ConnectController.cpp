#include "viewmodels/ConnectController.h"

#include "domain/ServerUrl.h"
#include "services/SettingsManager.h"

#include <QVariantMap>

namespace Hypernucleus {

ConnectController::ConnectController(SettingsManager* settings,
                                     SiteDirectory* sites, QObject* parent)
    : QObject(parent), m_settings(settings), m_sites(sites)
{
    connect(m_settings, &SettingsManager::recentServersChanged, this,
            &ConnectController::serversChanged);
    connect(m_settings, &SettingsManager::tenantSlugChanged, this,
            &ConnectController::needsConnectChanged);
}

QVariantList ConnectController::servers() const
{
    QVariantList out;
    for (const QString& url : m_settings->serverChoices())
        out.append(QVariantMap{{"value", url}, {"label", url}});
    return out;
}

bool ConnectController::needsConnect() const
{
    return m_settings->tenantSlug().isEmpty();
}

QString ConnectController::serverError(const QString& url) const
{
    return ServerUrl::error(url);
}

bool ConnectController::connectTo(const QString& url, const QString& site)
{
    const QString server = ServerUrl::normalize(url);
    const QString slug = site.trimmed();
    if (server.isEmpty() || slug.isEmpty()) return false;
    m_settings->rememberServer(server);
    m_settings->setTenantSlug(slug);
    m_settings->setRepoUrl(server);
    m_settings->save();
    return true;
}

} // namespace Hypernucleus
