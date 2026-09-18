#include "services/ApiClient.h"

#include <QJsonArray>
#include <QJsonDocument>
#include <QNetworkRequest>
#include <QUrlQuery>

namespace Hypernucleus {

void ApiClient::getJson(const QString& path, JsonHandler handler)
{
    auto* reply = m_nam->get(createRequest(path));
    connect(reply, &QNetworkReply::finished, this,
            [reply, handler = std::move(handler)]() {
                reply->deleteLater();
                const int status =
                    reply->attribute(QNetworkRequest::HttpStatusCodeAttribute)
                        .toInt();
                const QByteArray body = reply->readAll();
                const QJsonDocument doc = QJsonDocument::fromJson(body);
                if (reply->error() != QNetworkReply::NoError) {
                    QString msg = doc.object().value("error").toString();
                    if (msg.isEmpty()) msg = reply->errorString();
                    handler(false, doc, status, msg);
                    return;
                }
                if (doc.isNull()) {
                    handler(false, doc, status,
                            QStringLiteral("Invalid JSON response"));
                    return;
                }
                handler(true, doc, status, QString());
            });
}

bool ApiClient::isLoading() const { return m_loading; }

QString ApiClient::error() const { return m_error; }

void ApiClient::setToken(const QString& token) { m_token = token; }

void ApiClient::clearToken() { m_token.clear(); }

bool ApiClient::hasToken() const { return !m_token.isEmpty(); }

QNetworkRequest ApiClient::createRequest(const QString& path) const
{
    QNetworkRequest request(resolveUrl(path));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Accept", "application/json");

    if (!m_token.isEmpty()) {
        request.setRawHeader("Authorization", ("Bearer " + m_token).toUtf8());
    }

    return request;
}

} // namespace Hypernucleus
