#include "services/ApiClient.h"

#include <QJsonArray>
#include <QJsonDocument>
#include <QNetworkRequest>
#include <QUrlQuery>

namespace Hypernucleus {

void ApiClient::loginWithTenant(const QString& username,
                                const QString& password, const QString& tenant)
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
            int statusCode =
                reply->attribute(QNetworkRequest::HttpStatusCodeAttribute)
                    .toInt();
            const QString serverMsg = QJsonDocument::fromJson(reply->readAll())
                                          .object()
                                          .value("error")
                                          .toString();
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

} // namespace Hypernucleus
