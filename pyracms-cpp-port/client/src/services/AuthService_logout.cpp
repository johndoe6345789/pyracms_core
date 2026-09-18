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
    QString savedToken = qsettings.value("auth/token").toString();
    QString savedUsername = qsettings.value("auth/username").toString();

    m_apiClient->setTenant(m_settings->tenantSlug());
    if (!savedToken.isEmpty() && !savedUsername.isEmpty()) {
        setToken(savedToken);
        setUsername(savedUsername);
        m_apiClient->setToken(savedToken);
        setAuthenticated(true);
    }
}

void AuthService::setAuthenticated(bool auth)
{
    if (m_authenticated == auth) return;
    m_authenticated = auth;
    emit authenticatedChanged();
}

void AuthService::setUsername(const QString& username)
{
    if (m_username == username) return;
    m_username = username;
    emit usernameChanged();
}

void AuthService::setToken(const QString& token)
{
    if (m_token == token) return;
    m_token = token;
    emit tokenChanged();
}

void AuthService::saveSession()
{
    QSettings qsettings;
    qsettings.setValue("auth/token", m_token);
    qsettings.setValue("auth/username", m_username);
    qsettings.sync();
}

void AuthService::clearSession()
{
    QSettings qsettings;
    qsettings.remove("auth/token");
    qsettings.remove("auth/username");
    qsettings.sync();
}

} // namespace Hypernucleus
