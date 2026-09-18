#include "services/DownloadManager.h"
#include "services/ApiClient.h"
#include "domain/DownloadVerifier.h"

#include <QDir>
#include <QFileInfo>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QPointer>
#include <QTimer>

namespace Hypernucleus {

void DownloadManager::sendRequest(Job* job)
{
    const Request& req = job->req;
    // Never leak the bearer token to a third-party host.
    const bool sameHost = req.url.host() == m_api->resolveUrl("/").host();
    QNetworkRequest netReq =
        sameHost ? m_api->authorizedRequest(req.url) : QNetworkRequest(req.url);
    netReq.setAttribute(QNetworkRequest::RedirectPolicyAttribute,
                        QNetworkRequest::NoLessSafeRedirectPolicy);
    if (job->offset > 0)
        netReq.setRawHeader("Range",
                            "bytes=" + QByteArray::number(job->offset) + "-");

    job->reply = m_api->network()->get(netReq);
    m_jobs.insert(req.id, job);
    emit started(req.id, job->offset);

    connect(job->reply, &QNetworkReply::readyRead, this, [this, id = req.id]() {
        if (Job* j = m_jobs.value(id)) onReadyRead(j);
    });
    connect(job->reply, &QNetworkReply::downloadProgress, this,
            [this, id = req.id](qint64 received, qint64 total) {
                Job* j = m_jobs.value(id);
                if (!j) return;
                const qint64 all =
                    total > 0 ? j->offset + total : j->req.expectedSize;
                emit progress(id, j->offset + received, all);
            });
    connect(job->reply, &QNetworkReply::finished, this, [this, id = req.id]() {
        if (Job* j = m_jobs.value(id)) onFinished(j);
    });
}

} // namespace Hypernucleus
