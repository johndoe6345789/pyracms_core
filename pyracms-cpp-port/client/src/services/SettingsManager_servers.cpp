#include "services/SettingsManager.h"

#include "domain/ServerUrl.h"

namespace Hypernucleus {

QStringList SettingsManager::serverChoices() const
{
    return ServerUrl::choices(m_recentServers);
}

void SettingsManager::setRecentServers(const QStringList& urls)
{
    QStringList clean;
    for (auto it = urls.crbegin(); it != urls.crend(); ++it)
        clean = ServerUrl::remember(clean, *it);
    if (m_recentServers == clean) return;
    m_recentServers = clean;
    emit recentServersChanged();
}

void SettingsManager::rememberServer(const QString& url)
{
    setRecentServers(ServerUrl::remember(m_recentServers, url));
}

} // namespace Hypernucleus
