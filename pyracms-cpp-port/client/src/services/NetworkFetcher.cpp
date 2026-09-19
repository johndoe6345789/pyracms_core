#include "services/HttpFetcher.h"

#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>

namespace Hypernucleus {

NetworkFetcher::NetworkFetcher(QNetworkAccessManager* nam, QObject* parent)
    : HttpFetcher(parent), m_nam(nam)
{
}

void NetworkFetcher::get(const QUrl& url, Done done)
{
    QNetworkRequest req(url);
    req.setRawHeader("User-Agent", "Hypernucleus");
    req.setRawHeader("Accept", "application/vnd.github+json, */*");
    req.setAttribute(QNetworkRequest::RedirectPolicyAttribute,
                     QNetworkRequest::NoLessSafeRedirectPolicy);
    QNetworkReply* reply = m_nam->get(req);
    connect(reply, &QNetworkReply::finished, this, [reply, done]() {
        const bool ok = reply->error() == QNetworkReply::NoError;
        const QByteArray body = reply->readAll();
        const QString err = ok ? QString() : reply->errorString();
        reply->deleteLater();
        done(ok, body, err);
    });
}

} // namespace Hypernucleus
