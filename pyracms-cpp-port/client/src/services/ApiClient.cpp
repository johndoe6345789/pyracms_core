#include "services/ApiClient.h"

#include <QJsonArray>
#include <QJsonDocument>
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

QString ApiClient::tenant() const
{
    return m_tenant;
}

void ApiClient::setTenant(const QString& slug)
{
    const QString trimmed = slug.trimmed();
    if (m_tenant == trimmed)
        return;
    m_tenant = trimmed;
    emit tenantChanged();
}

QUrl ApiClient::resolveUrl(const QString& pathOrUrl) const
{
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://"))
        return QUrl(pathOrUrl);
    QString base = m_baseUrl;
    while (base.endsWith('/'))
        base.chop(1);
    return QUrl(base + (pathOrUrl.startsWith('/') ? "" : "/") + pathOrUrl);
}

QNetworkRequest ApiClient::authorizedRequest(const QUrl& url) const
{
    QNetworkRequest request(url);
    request.setRawHeader("Accept", "application/json, */*");
    if (!m_token.isEmpty())
        request.setRawHeader("Authorization", ("Bearer " + m_token).toUtf8());
    if (!m_tenant.isEmpty())
        request.setRawHeader("X-Tenant", m_tenant.toUtf8());
    return request;
}

void ApiClient::getJson(const QString& path, JsonHandler handler)
{
    auto* reply = m_nam->get(createRequest(path));
    connect(reply, &QNetworkReply::finished, this,
            [reply, handler = std::move(handler)]() {
        reply->deleteLater();
        const int status = reply->attribute(
            QNetworkRequest::HttpStatusCodeAttribute).toInt();
        const QByteArray body = reply->readAll();
        const QJsonDocument doc = QJsonDocument::fromJson(body);
        if (reply->error() != QNetworkReply::NoError) {
            QString msg = doc.object().value("error").toString();
            if (msg.isEmpty())
                msg = reply->errorString();
            handler(false, doc, status, msg);
            return;
        }
        if (doc.isNull()) {
            handler(false, doc, status, QStringLiteral("Invalid JSON response"));
            return;
        }
        handler(true, doc, status, QString());
    });
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
    QNetworkRequest request(resolveUrl(path));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Accept", "application/json");

    if (!m_token.isEmpty()) {
        request.setRawHeader("Authorization", ("Bearer " + m_token).toUtf8());
    }
    if (!m_tenant.isEmpty()) {
        request.setRawHeader("X-Tenant", m_tenant.toUtf8());
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

    auto* reply = m_nam->get(createRequest("/api/outputs/json"));
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
    loginWithTenant(username, password, m_tenant);
}

void ApiClient::loginWithTenant(const QString& username, const QString& password,
                                const QString& tenant)
{
    setLoading(true);
    setError(QString());
    setTenant(tenant);

    QJsonObject body;
    body["username"] = username;
    body["password"] = password;
    body["tenant"] = m_tenant;

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
            const QString serverMsg = QJsonDocument::fromJson(reply->readAll())
                .object().value("error").toString();
            if (statusCode == 401) {
                emit loginResponse(false, "Invalid username, password or site");
            } else if (!serverMsg.isEmpty()) {
                emit loginResponse(false, serverMsg);
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
    if (!m_tenant.isEmpty())
        body["tenant"] = m_tenant;

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
