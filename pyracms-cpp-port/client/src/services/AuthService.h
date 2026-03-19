#pragma once

#include <QObject>
#include <QString>

namespace Hypernucleus {

class ApiClient;
class SettingsManager;

class AuthService : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool authenticated READ isAuthenticated NOTIFY authenticatedChanged)
    Q_PROPERTY(QString username READ username NOTIFY usernameChanged)
    Q_PROPERTY(QString token READ token NOTIFY tokenChanged)

public:
    explicit AuthService(ApiClient* apiClient, SettingsManager* settings,
                         QObject* parent = nullptr);

    bool isAuthenticated() const;
    QString username() const;
    QString token() const;

    Q_INVOKABLE void login(const QString& username, const QString& password);
    Q_INVOKABLE void registerUser(const QString& username, const QString& email,
                                   const QString& password);
    Q_INVOKABLE void logout();
    Q_INVOKABLE void restoreSession();

signals:
    void authenticatedChanged();
    void usernameChanged();
    void tokenChanged();
    void loginSuccess();
    void loginFailed(const QString& error);
    void registerSuccess();
    void registerFailed(const QString& error);
    void loggedOut();

private:
    void setAuthenticated(bool auth);
    void setUsername(const QString& username);
    void setToken(const QString& token);
    void saveSession();
    void clearSession();

    ApiClient* m_apiClient;
    SettingsManager* m_settings;
    bool m_authenticated = false;
    QString m_username;
    QString m_token;
};

} // namespace Hypernucleus
