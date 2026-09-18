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

void DownloadManager::start(const Request& req)
{
    if (m_jobs.contains(req.id)) {
        emit failed(req.id, QStringLiteral("Already downloading"));
        return;
    }
    QDir().mkpath(QFileInfo(req.destPath).absolutePath());

    // A previously completed, verifiable download can be reused as is.
    const bool canTrustExisting =
        req.expectedSize > 0 || !req.expectedSha256.isEmpty();
    if (canTrustExisting && QFileInfo::exists(req.destPath) &&
        DownloadVerifier::verify(req.destPath, req.expectedSize,
                                 req.expectedSha256)
            .ok) {
        finishNow(req);
        return;
    }

    auto* job = new Job;
    job->req = req;
    const QString partPath = req.destPath + ".part";
    job->offset = DownloadVerifier::resumeOffset(partPath, req.expectedSize);
    if (job->offset == 0) QFile::remove(partPath);
    job->part.setFileName(partPath);

    // Whole file already present as .part: only verification is missing.
    if (job->offset > 0 && req.expectedSize > 0 &&
        job->offset == req.expectedSize) {
        m_jobs.insert(req.id, job);
        emit started(req.id, job->offset);
        QTimer::singleShot(0, this, [this, id = req.id]() {
            if (Job* j = m_jobs.value(id)) complete(j);
        });
        return;
    }
    const QIODevice::OpenMode mode =
        job->offset > 0 ? (QIODevice::WriteOnly | QIODevice::Append)
                        : (QIODevice::WriteOnly | QIODevice::Truncate);
    if (!job->part.open(mode)) {
        const QString err = "Cannot write " + partPath;
        delete job;
        emit failed(req.id, err);
        return;
    }
    sendRequest(job);
}

} // namespace Hypernucleus
