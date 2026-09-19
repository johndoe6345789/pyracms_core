#include "services/AuthService.h"
#include "services/ApiClient.h"
#include "services/SettingsManager.h"

#include <QSettings>

namespace Hypernucleus {

AuthService::AuthService(ApiClient* apiClient, SettingsManager* settings,
                         QObject* parent)
    : AuthService(apiClient, settings, createPlatformSecretStore(), parent)
{
}

AuthService::AuthService(ApiClient* apiClient, SettingsManager* settings,
                         std::unique_ptr<SecretStore> store, QObject* parent)
    : QObject(parent), m_apiClient(apiClient), m_settings(settings),
      m_vault(std::move(store))
{
    connectApi();
}

void AuthService::connectApi()
{
    connect(m_apiClient, &ApiClient::loginResponse, this,
            [this](bool success, const QString& tokenOrError) {
                if (success) {
                    setToken(tokenOrError);
                    m_apiClient->setToken(tokenOrError);
                    setAuthenticated(true);
                    saveSession();
                    m_settings->save();
                    emit loginSuccess();
                } else {
                    setAuthenticated(false);
                    emit loginFailed(tokenOrError);
                }
            });

    connect(m_apiClient, &ApiClient::registerResponse, this,
            [this](bool success, const QString& message) {
                if (success) {
                    emit registerSuccess();
                } else {
                    emit registerFailed(message);
                }
            });
}

bool AuthService::isAuthenticated() const { return m_authenticated; }

QString AuthService::username() const { return m_username; }

QString AuthService::token() const { return m_token; }

void AuthService::login(const QString& username, const QString& password,
                        const QString& tenant)
{
    setUsername(username);
    m_settings->setTenantSlug(tenant);
    m_apiClient->loginWithTenant(username, password, tenant);
}

void AuthService::registerUser(const QString& username, const QString& email,
                               const QString& password)
{
    m_apiClient->registerUser(username, email, password);
}

} // namespace Hypernucleus
