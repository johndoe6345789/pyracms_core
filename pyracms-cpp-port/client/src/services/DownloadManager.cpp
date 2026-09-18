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

DownloadManager::DownloadManager(ApiClient* api, QObject* parent)
    : QObject(parent)
    , m_api(api)
{
}

DownloadManager::~DownloadManager()
{
    const auto jobs = m_jobs.values();
    for (Job* job : jobs) {
        if (job->reply) {
            job->reply->disconnect(this);
            job->reply->abort();
            job->reply->deleteLater();
        }
        job->part.close();
        delete job;
    }
    m_jobs.clear();
}

bool DownloadManager::isActive(const QString& id) const
{
    return m_jobs.contains(id);
}

void DownloadManager::finishNow(const Request& req)
{
    QTimer::singleShot(0, this, [this, req]() {
        emit progress(req.id, req.expectedSize, req.expectedSize);
        emit finished(req.id, req.destPath);
    });
}

void DownloadManager::start(const Request& req)
{
    if (m_jobs.contains(req.id)) {
        emit failed(req.id, QStringLiteral("Already downloading"));
        return;
    }
    QDir().mkpath(QFileInfo(req.destPath).absolutePath());

    // A previously completed, verifiable download can be reused as is.
    const bool canTrustExisting = req.expectedSize > 0 || !req.expectedSha256.isEmpty();
    if (canTrustExisting && QFileInfo::exists(req.destPath)
        && DownloadVerifier::verify(req.destPath, req.expectedSize,
                                    req.expectedSha256).ok) {
        finishNow(req);
        return;
    }

    auto* job = new Job;
    job->req = req;
    const QString partPath = req.destPath + ".part";
    job->offset = DownloadVerifier::resumeOffset(partPath, req.expectedSize);
    if (job->offset == 0)
        QFile::remove(partPath);

    job->part.setFileName(partPath);
    // Whole file already present as .part: only verification is missing.
    if (job->offset > 0 && req.expectedSize > 0 && job->offset == req.expectedSize) {
        m_jobs.insert(req.id, job);
        emit started(req.id, job->offset);
        QTimer::singleShot(0, this, [this, id = req.id]() {
            if (Job* j = m_jobs.value(id))
                complete(j);
        });
        return;
    }

    const QIODevice::OpenMode mode = job->offset > 0
        ? (QIODevice::WriteOnly | QIODevice::Append)
        : (QIODevice::WriteOnly | QIODevice::Truncate);
    if (!job->part.open(mode)) {
        const QString err = "Cannot write " + partPath;
        delete job;
        emit failed(req.id, err);
        return;
    }

    // Never leak the bearer token to a third-party host.
    const bool sameHost = req.url.host() == m_api->resolveUrl("/").host();
    QNetworkRequest netReq = sameHost ? m_api->authorizedRequest(req.url)
                                      : QNetworkRequest(req.url);
    netReq.setAttribute(QNetworkRequest::RedirectPolicyAttribute,
                        QNetworkRequest::NoLessSafeRedirectPolicy);
    if (job->offset > 0)
        netReq.setRawHeader("Range", "bytes=" + QByteArray::number(job->offset) + "-");

    job->reply = m_api->network()->get(netReq);
    m_jobs.insert(req.id, job);
    emit started(req.id, job->offset);

    connect(job->reply, &QNetworkReply::readyRead, this,
            [this, id = req.id]() { if (Job* j = m_jobs.value(id)) onReadyRead(j); });
    connect(job->reply, &QNetworkReply::downloadProgress, this,
            [this, id = req.id](qint64 received, qint64 total) {
        Job* j = m_jobs.value(id);
        if (!j)
            return;
        const qint64 all = total > 0 ? j->offset + total : j->req.expectedSize;
        emit progress(id, j->offset + received, all);
    });
    connect(job->reply, &QNetworkReply::finished, this,
            [this, id = req.id]() { if (Job* j = m_jobs.value(id)) onFinished(j); });
}

void DownloadManager::onReadyRead(Job* job)
{
    if (!job->headerChecked) {
        job->headerChecked = true;
        const int status = job->reply->attribute(
            QNetworkRequest::HttpStatusCodeAttribute).toInt();
        if (job->offset > 0 && status == 200) {
            // Server ignored the Range header: start over.
            job->part.resize(0);
            job->part.seek(0);
            job->offset = 0;
        }
    }
    job->part.write(job->reply->readAll());
}

void DownloadManager::onFinished(Job* job)
{
    const QString id = job->req.id;
    QNetworkReply* reply = job->reply;
    const int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
    const QNetworkReply::NetworkError err = reply->error();
    const QString errText = reply->errorString();
    if (err == QNetworkReply::NoError)
        job->part.write(reply->readAll());
    job->part.flush();

    if (job->cancelled) {
        removeJob(id);
        emit cancelled(id);
        return;
    }
    // 416: the .part file already covers the whole resource.
    if (status == 416 && job->offset > 0) {
        complete(job);
        return;
    }
    if (err != QNetworkReply::NoError) {
        removeJob(id);   // keeps <dest>.part for the next resume attempt
        emit failed(id, status > 0 ? QStringLiteral("HTTP %1: %2").arg(status).arg(errText)
                                   : errText);
        return;
    }
    complete(job);
}

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
        QFile::remove(partPath);   // corrupt data must not be resumed
        emit failed(req.id, vr.error);
        return;
    }
    QFile::remove(req.destPath);
    if (!QFile::rename(partPath, req.destPath)) {
        emit failed(req.id, "Could not finalize " + req.destPath);
        return;
    }
    emit finished(req.id, req.destPath);
}

void DownloadManager::cancel(const QString& id)
{
    Job* job = m_jobs.value(id);
    if (!job)
        return;
    job->cancelled = true;
    if (job->reply)
        job->reply->abort();   // triggers finished -> cancelled()
    else {
        removeJob(id);
        emit cancelled(id);
    }
}

void DownloadManager::removeJob(const QString& id)
{
    Job* job = m_jobs.take(id);
    if (!job)
        return;
    job->part.close();
    if (job->reply) {
        job->reply->disconnect(this);
        job->reply->deleteLater();
    }
    delete job;
}

} // namespace Hypernucleus
