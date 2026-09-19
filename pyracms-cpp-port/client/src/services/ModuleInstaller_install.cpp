#include "services/ModuleInstaller.h"
#include "services/ApiClient.h"
#include "services/ArchiveExtractor.h"
#include "services/DownloadManager.h"
#include "services/PathManager.h"

#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QRegularExpression>
#include <QUrl>
#include <functional>

namespace Hypernucleus {

namespace {

QString safeFileName(const QString& s)
{
    static const QRegularExpression bad("[^A-Za-z0-9._-]");
    QString out = s;
    out.replace(bad, "_");
    return out;
}

} // namespace

void ModuleInstaller::install(const QString& name, const QString& version,
                              const QJsonObject& revisionData,
                              const QString& type)
{
    if (m_busy) {
        emit installFailed(name, tr("Another installation is in progress"));
        return;
    }
    const InstallRecord existing = m_store.get(name);
    if (existing.isValid() && existing.version == version &&
        QDir(existing.path).exists()) {
        emit installComplete(name, version);
        return;
    }

    setBusy(true);
    const DownloadTarget target = DownloadTarget::fromJson(revisionData);
    if (!target.ok) {
        fail(name, tr("No file UUID in revision data"));
        return;
    }

    m_job = InstallJob{name, version, type, target,
                m_pathManager->archivePath(
                    safeFileName(type + "-" + name + "-" + version) + ".zip")};
    m_hasJob = true;
    emit installStarted(name);

    DownloadManager::Request req;
    req.id = name;
    req.url =
        target.url.isEmpty()
            ? m_apiClient->resolveUrl(
                  QStringLiteral("/api/files/") +
                  QString::fromLatin1(QUrl::toPercentEncoding(target.fileRef)))
            : m_apiClient->resolveUrl(target.url);
    req.destPath = m_job.archivePath;
    req.expectedSize = target.size;
    req.expectedSha256 = target.sha256;
    m_downloads->start(req);
}

void ModuleInstaller::cancel()
{
    if (m_hasJob) m_downloads->cancel(m_job.name);
}

} // namespace Hypernucleus
