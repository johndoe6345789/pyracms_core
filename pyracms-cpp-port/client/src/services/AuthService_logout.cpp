#include "services/AuthService.h"
#include "services/ApiClient.h"
#include "services/SettingsManager.h"

#include <QSettings>

namespace Hypernucleus {

void AuthService::logout()
{
    m_apiClient->clearToken();
    clearSession();
    setAuthenticated(false);
    setUsername(QString());
    setToken(QString());
    emit loggedOut();
}

void AuthService::restoreSession()
{
    QSettings qsettings;
    m_vault.migrateFromSettings(qsettings);
    const QString savedToken = m_vault.load();
    const QString savedUsername = qsettings.value("auth/username").toString();

    m_apiClient->setTenant(m_settings->tenantSlug());
    if (!savedToken.isEmpty() && !savedUsername.isEmpty()) {
        setToken(savedToken);
        setUsername(savedUsername);
        m_apiClient->setToken(savedToken);
        setAuthenticated(true);
    }
    warnIfSessionOnly();
}

void AuthService::saveSession()
{
    QSettings qsettings;
    qsettings.setValue("auth/username", m_username);
    qsettings.remove("auth/token"); // never in plain text
    qsettings.sync();
    m_vault.save(m_token);
    warnIfSessionOnly();
}

void AuthService::clearSession()
{
    m_vault.clear();
    QSettings qsettings;
    qsettings.remove("auth/token");
    qsettings.remove("auth/username");
    qsettings.sync();
}

} // namespace Hypernucleus
