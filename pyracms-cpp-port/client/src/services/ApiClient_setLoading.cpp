#include "services/ApiClient.h"

#include <QJsonArray>
#include <QJsonDocument>
#include <QNetworkRequest>
#include <QUrlQuery>

namespace Hypernucleus {

void ApiClient::setLoading(bool loading)
{
    if (m_loading == loading) return;
    m_loading = loading;
    emit loadingChanged();
}

void ApiClient::setError(const QString& error)
{
    if (m_error == error) return;
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
            setError(tr("Invalid JSON response from catalog endpoint"));
            emit networkError(m_error);
            return;
        }

        emit catalogFetched(doc.object());
    });
}

} // namespace Hypernucleus
