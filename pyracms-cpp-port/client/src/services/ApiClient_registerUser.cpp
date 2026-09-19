#include "services/ApiClient.h"

#include <QJsonArray>
#include <QJsonDocument>
#include <QNetworkRequest>
#include <QUrlQuery>

namespace Hypernucleus {

void ApiClient::registerUser(const QString& username, const QString& email,
                             const QString& password)
{
    setLoading(true);
    setError(QString());

    QJsonObject body;
    body["username"] = username;
    body["email"] = email;
    body["password"] = password;
    if (!m_tenant.isEmpty()) body["tenant"] = m_tenant;

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
            QString msg =
                doc.object().value("message").toString(reply->errorString());
            emit registerResponse(false, msg);
            return;
        }

        QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
        QString msg =
            doc.object().value("message").toString(tr("Registration successful"));
        emit registerResponse(true, msg);
    });
}

} // namespace Hypernucleus
