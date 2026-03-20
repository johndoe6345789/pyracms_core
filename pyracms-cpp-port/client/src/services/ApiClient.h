#pragma once

#include <QObject>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QJsonObject>
#include <QJsonDocument>
#include <QString>
#include <QUrl>

namespace Hypernucleus {

class ApiClient : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString baseUrl READ baseUrl WRITE setBaseUrl NOTIFY baseUrlChanged)
    Q_PROPERTY(bool loading READ isLoading NOTIFY loadingChanged)
    Q_PROPERTY(QString error READ error NOTIFY errorChanged)

public:
    explicit ApiClient(QObject* parent = nullptr);

    // Properties
    QString baseUrl() const;
    void setBaseUrl(const QString& url);
    bool isLoading() const;
    QString error() const;

    // Token management
    Q_INVOKABLE void setToken(const QString& token);
    Q_INVOKABLE void clearToken();
    bool hasToken() const;

    // API calls
    Q_INVOKABLE void fetchCatalog();
    Q_INVOKABLE void fetchFile(const QString& uuid);
    Q_INVOKABLE void fetchThumbnail(const QString& uuid);
    Q_INVOKABLE void login(const QString& username, const QString& password);
    Q_INVOKABLE void registerUser(const QString& username, const QString& email,
                                   const QString& password);

signals:
    void baseUrlChanged();
    void loadingChanged();
    void errorChanged();

    void catalogFetched(const QJsonObject& catalog);
    void fileFetched(const QString& uuid, const QByteArray& data);
    void thumbnailFetched(const QString& uuid, const QByteArray& data);
    void loginResponse(bool success, const QString& tokenOrError);
    void registerResponse(bool success, const QString& message);

    void downloadProgress(const QString& uuid, qint64 received, qint64 total);
    void networkError(const QString& message);

private:
    QNetworkRequest createRequest(const QString& path) const;
    void setLoading(bool loading);
    void setError(const QString& error);
    void handleNetworkError(QNetworkReply* reply);

    QNetworkAccessManager* m_nam;
    QString m_baseUrl;
    QString m_token;
    bool m_loading = false;
    QString m_error;
    int m_activeRequests = 0;
};

} // namespace Hypernucleus
