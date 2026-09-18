#include "services/PipResolver.h"

#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QRegularExpression>
#include <QSharedPointer>
#include <QTimer>
#include <QUrl>

namespace Hypernucleus {

void PipResolver::check(const QStringList& names, Callback done)
{
    auto result = QSharedPointer<QMap<QString, bool>>::create();
    auto pending = QSharedPointer<int>::create(0);
    QStringList toAsk;

    for (const QString& n : names) {
        const QString key = normalizeName(n);
        if (key.isEmpty() || result->contains(n)) continue;
        if (m_cache.contains(key)) {
            result->insert(n, m_cache.value(key));
        } else {
            result->insert(n, false);
            toAsk << n;
        }
    }

    if (toAsk.isEmpty()) {
        QTimer::singleShot(0, this, [result, done]() { done(*result); });
        return;
    }

    *pending = toAsk.size();
    for (const QString& n : toAsk) {
        const QString key = normalizeName(n);
        QNetworkRequest req(
            QUrl(m_indexUrl + "/" +
                 QString::fromLatin1(QUrl::toPercentEncoding(key)) + "/json"));
        req.setTransferTimeout(8000);
        req.setRawHeader("Accept", "application/json");
        QNetworkReply* reply = m_nam->get(req);
        connect(
            reply, &QNetworkReply::finished, this,
            [this, reply, n, key, result, pending, done]() {
                const int status =
                    reply->attribute(QNetworkRequest::HttpStatusCodeAttribute)
                        .toInt();
                const bool exists =
                    reply->error() == QNetworkReply::NoError && status == 200;
                reply->deleteLater();
                result->insert(n, exists);
                // Cache definitive answers only (200 / 404), not network
                // trouble.
                if (exists || status == 404) m_cache.insert(key, exists);
                if (--*pending == 0) done(*result);
            });
    }
}

} // namespace Hypernucleus
