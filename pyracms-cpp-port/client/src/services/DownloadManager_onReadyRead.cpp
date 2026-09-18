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

void DownloadManager::onReadyRead(Job* job)
{
    if (!job->headerChecked) {
        job->headerChecked = true;
        const int status =
            job->reply->attribute(QNetworkRequest::HttpStatusCodeAttribute)
                .toInt();
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
    const int status =
        reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
    const QNetworkReply::NetworkError err = reply->error();
    const QString errText = reply->errorString();
    if (err == QNetworkReply::NoError) job->part.write(reply->readAll());
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
        removeJob(id); // keeps <dest>.part for the next resume attempt
        emit failed(id,
                    status > 0
                        ? QStringLiteral("HTTP %1: %2").arg(status).arg(errText)
                        : errText);
        return;
    }
    complete(job);
}

} // namespace Hypernucleus
