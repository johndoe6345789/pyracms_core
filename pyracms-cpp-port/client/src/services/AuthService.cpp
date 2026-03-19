#include "services/AuthService.h"
#include "services/ApiClient.h"
#include "services/SettingsManager.h"

#include <QSettings>

namespace Hypernucleus {

AuthService::AuthService(ApiClient* apiClient, SettingsManager* settings,
                         QObject* parent)
    : QObject(parent)
    , m_apiClient(apiClient)
    , m_settings(settings)
{
    connect(m_apiClient, &ApiClient::loginResponse,
            this, [this](bool success, const QString& tokenOrError) {
        if (success) {
            setToken(tokenOrError);
            m_apiClient->setToken(tokenOrError);
            setAuthenticated(true);
            saveSession();
            emit loginSuccess();
        } else {
            setAuthenticated(false);
            emit loginFailed(tokenOrError);
        }
    });

    connect(m_apiClient, &ApiClient::registerResponse,
            this, [this](bool success, const QString& message) {
        if (success) {
            emit registerSuccess();
        } else {
            emit registerFailed(message);
        }
    });
}

bool AuthService::isAuthenticated() const
{
    return m_authenticated;
}

QString AuthService::username() const
{
    return m_username;
}

QString AuthService::token() const
{
    return m_token;
}

void AuthService::login(const QString& username, const QString& password)
{
    setUsername(username);
    m_apiClient->login(username, password);
}

void AuthService::registerUser(const QString& username, const QString& email,
                                const QString& password)
{
    m_apiClient->registerUser(username, email, password);
}

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

    if (!savedToken.isEmpty() && !savedUsername.isEmpty()) {
        setToken(savedToken);
        setUsername(savedUsername);
        m_apiClient->setToken(savedToken);
        setAuthenticated(true);
    }
}

void AuthService::setAuthenticated(bool auth)
{
    if (m_authenticated == auth)
        return;
    m_authenticated = auth;
    emit authenticatedChanged();
}

void AuthService::setUsername(const QString& username)
{
    if (m_username == username)
        return;
    m_username = username;
    emit usernameChanged();
}

void AuthService::setToken(const QString& token)
{
    if (m_token == token)
        return;
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
