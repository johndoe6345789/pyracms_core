#include "services/ApiClient.h"

#include <QJsonArray>
#include <QJsonDocument>
#include <QNetworkRequest>
#include <QUrlQuery>

namespace Hypernucleus {

void ApiClient::fetchFile(const QString& uuid)
{
    setLoading(true);
    setError(QString());

    auto* reply = m_nam->get(createRequest("/api/files/" + uuid));
    m_activeRequests++;

    connect(reply, &QNetworkReply::downloadProgress, this,
            [this, uuid](qint64 received, qint64 total) {
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
    auto* reply = m_nam->get(
        createRequest("/api/files/" + uuid + "/thumbnail"));

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

} // namespace Hypernucleus
