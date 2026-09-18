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
    : QObject(parent), m_api(api)
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

} // namespace Hypernucleus
