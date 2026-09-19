#include "services/AuthService.h"
#include "services/ApiClient.h"
#include "services/SettingsManager.h"

namespace Hypernucleus {

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

void AuthService::warnIfSessionOnly()
{
    if (!m_vault.sessionOnly()) return;
    emit secureStorageUnavailable(
        tr("No secure keychain is available: you stay signed in until "
           "the launcher closes, the login is not saved."));
}

} // namespace Hypernucleus
