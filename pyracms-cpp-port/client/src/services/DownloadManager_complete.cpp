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

void DownloadManager::complete(Job* job)
{
    const Request req = job->req;
    const QString partPath = job->part.fileName();
    job->part.close();
    emit verifying(req.id);

    const VerifyResult vr = DownloadVerifier::verify(partPath, req.expectedSize,
                                                     req.expectedSha256);
    removeJob(req.id);
    if (!vr.ok) {
        QFile::remove(partPath); // corrupt data must not be resumed
        emit failed(req.id, vr.error);
        return;
    }
    QFile::remove(req.destPath);
    if (!QFile::rename(partPath, req.destPath)) {
        emit failed(req.id, tr("Could not finalize %1").arg(req.destPath));
        return;
    }
    emit finished(req.id, req.destPath);
}

void DownloadManager::cancel(const QString& id)
{
    Job* job = m_jobs.value(id);
    if (!job) return;
    job->cancelled = true;
    if (job->reply)
        job->reply->abort(); // triggers finished -> cancelled()
    else {
        removeJob(id);
        emit cancelled(id);
    }
}

void DownloadManager::removeJob(const QString& id)
{
    Job* job = m_jobs.take(id);
    if (!job) return;
    job->part.close();
    if (job->reply) {
        job->reply->disconnect(this);
        job->reply->deleteLater();
    }
    delete job;
}

} // namespace Hypernucleus
