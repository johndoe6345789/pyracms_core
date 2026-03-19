#include "services/ApiClient.h"

#include <QJsonArray>
#include <QNetworkRequest>
#include <QUrlQuery>

namespace Hypernucleus {

ApiClient::ApiClient(QObject* parent)
    : QObject(parent)
    , m_nam(new QNetworkAccessManager(this))
    , m_baseUrl("http://localhost:8080")
{
}

QString ApiClient::baseUrl() const
{
    return m_baseUrl;
}

void ApiClient::setBaseUrl(const QString& url)
{
    if (m_baseUrl == url)
        return;
    m_baseUrl = url;
    emit baseUrlChanged();
}

bool ApiClient::isLoading() const
{
    return m_loading;
}

QString ApiClient::error() const
{
    return m_error;
}

void ApiClient::setToken(const QString& token)
{
    m_token = token;
}

void ApiClient::clearToken()
{
    m_token.clear();
}

bool ApiClient::hasToken() const
{
    return !m_token.isEmpty();
}

QNetworkRequest ApiClient::createRequest(const QString& path) const
{
    QUrl url(m_baseUrl + path);
    QNetworkRequest request(url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Accept", "application/json");

    if (!m_token.isEmpty()) {
        request.setRawHeader("Authorization", ("Bearer " + m_token).toUtf8());
    }

    return request;
}

void ApiClient::setLoading(bool loading)
{
    if (m_loading == loading)
        return;
    m_loading = loading;
    emit loadingChanged();
}

void ApiClient::setError(const QString& error)
{
    if (m_error == error)
        return;
    m_error = error;
    emit errorChanged();
}

void ApiClient::handleNetworkError(QNetworkReply* reply)
{
    QString errorMsg = reply->errorString();
    setError(errorMsg);
    emit networkError(errorMsg);
}

void ApiClient::fetchCatalog()
{
    setLoading(true);
    setError(QString());

    auto* reply = m_nam->get(createRequest("/api/catalog"));
    m_activeRequests++;

    connect(reply, &QNetworkReply::finished, this, [this, reply]() {
        reply->deleteLater();
        m_activeRequests--;
        if (m_activeRequests <= 0) {
            m_activeRequests = 0;
            setLoading(false);
        }

        if (reply->error() != QNetworkReply::NoError) {
            handleNetworkError(reply);
            return;
        }

        QByteArray responseData = reply->readAll();
        QJsonDocument doc = QJsonDocument::fromJson(responseData);
        if (doc.isNull() || !doc.isObject()) {
            setError("Invalid JSON response from catalog endpoint");
            emit networkError(m_error);
            return;
        }

        emit catalogFetched(doc.object());
    });
}

void ApiClient::fetchFile(const QString& uuid)
{
    setLoading(true);
    setError(QString());

    auto* reply = m_nam->get(createRequest("/api/files/" + uuid));
    m_activeRequests++;

    connect(reply, &QNetworkReply::downloadProgress,
            this, [this, uuid](qint64 received, qint64 total) {
        emit downloadProgress(uuid, received, total);
    });

    connect(reply, &QNetworkReply::finished, this, [this, reply, uuid]() {
        reply->deleteLater();
        m_activeRequests--;
        if (m_activeRequests <= 0) {
            m_activeRequests = 0;
            setLoading(false);
        }

        if (reply->error() != QNetworkReply::NoError) {
            handleNetworkError(reply);
            return;
        }

        emit fileFetched(uuid, reply->readAll());
    });
}

void ApiClient::fetchThumbnail(const QString& uuid)
{
    auto* reply = m_nam->get(createRequest("/api/thumbnails/" + uuid));

    connect(reply, &QNetworkReply::finished, this, [this, reply, uuid]() {
        reply->deleteLater();

        if (reply->error() != QNetworkReply::NoError) {
            // Thumbnails are non-critical; silently ignore errors
            return;
        }

        emit thumbnailFetched(uuid, reply->readAll());
    });
}

void ApiClient::login(const QString& username, const QString& password)
{
    setLoading(true);
    setError(QString());

    QJsonObject body;
    body["username"] = username;
    body["password"] = password;

    auto* reply = m_nam->post(createRequest("/api/auth/login"),
                               QJsonDocument(body).toJson());
    m_activeRequests++;

    connect(reply, &QNetworkReply::finished, this, [this, reply]() {
        reply->deleteLater();
        m_activeRequests--;
        if (m_activeRequests <= 0) {
            m_activeRequests = 0;
            setLoading(false);
        }

        if (reply->error() != QNetworkReply::NoError) {
            int statusCode = reply->attribute(
                QNetworkRequest::HttpStatusCodeAttribute).toInt();
            if (statusCode == 401) {
                emit loginResponse(false, "Invalid username or password");
            } else {
                emit loginResponse(false, reply->errorString());
            }
            return;
        }

        QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
        QJsonObject obj = doc.object();
        QString token = obj.value("token").toString();

        if (token.isEmpty()) {
            emit loginResponse(false, "No token received from server");
            return;
        }

        emit loginResponse(true, token);
    });
}

void ApiClient::registerUser(const QString& username, const QString& email,
                              const QString& password)
{
    setLoading(true);
    setError(QString());

    QJsonObject body;
    body["username"] = username;
    body["email"] = email;
    body["password"] = password;

    auto* reply = m_nam->post(createRequest("/api/auth/register"),
                               QJsonDocument(body).toJson());
    m_activeRequests++;

    connect(reply, &QNetworkReply::finished, this, [this, reply]() {
        reply->deleteLater();
        m_activeRequests--;
        if (m_activeRequests <= 0) {
            m_activeRequests = 0;
            setLoading(false);
        }

        if (reply->error() != QNetworkReply::NoError) {
            QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
            QString msg = doc.object().value("message").toString(reply->errorString());
            emit registerResponse(false, msg);
            return;
        }

        QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
        QString msg = doc.object().value("message").toString("Registration successful");
        emit registerResponse(true, msg);
    });
}

} // namespace Hypernucleus
