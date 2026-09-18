#include "services/ApiClient.h"

#include <QJsonArray>
#include <QJsonDocument>
#include <QNetworkRequest>
#include <QUrlQuery>

namespace Hypernucleus {

ApiClient::ApiClient(QObject* parent)
    : QObject(parent), m_nam(new QNetworkAccessManager(this)),
      m_baseUrl("http://localhost:8080")
{
}

QString ApiClient::baseUrl() const { return m_baseUrl; }

void ApiClient::setBaseUrl(const QString& url)
{
    if (m_baseUrl == url) return;
    m_baseUrl = url;
    emit baseUrlChanged();
}

QString ApiClient::tenant() const { return m_tenant; }

void ApiClient::setTenant(const QString& slug)
{
    const QString trimmed = slug.trimmed();
    if (m_tenant == trimmed) return;
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
    return request;
}

} // namespace Hypernucleus
