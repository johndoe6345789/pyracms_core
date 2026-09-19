#include "services/PythonProvisioner.h"
#include "services/DownloadManager.h"
#include "services/PathManager.h"

namespace Hypernucleus {

namespace {
const char* kDownloadId = "managed-python";
}

QString PythonProvisioner::releaseUrl()
{
    return QStringLiteral(
        "https://api.github.com/repos/astral-sh/python-build-standalone/"
        "releases/latest");
}

PythonProvisioner::PythonProvisioner(PathManager* paths, HttpFetcher* http,
                                     DownloadManager* downloads,
                                     ProcessRunner* tar, QObject* parent)
    : QObject(parent), m_paths(paths), m_http(http), m_downloads(downloads),
      m_tar(tar), m_releaseUrl(releaseUrl())
{
    const auto mine = [](const QString& id) { return id == kDownloadId; };
    connect(m_downloads, &DownloadManager::progress, this,
            [this, mine](const QString& id, qint64 r, qint64 t) {
                if (mine(id)) emit progress(r, t);
            });
    connect(m_downloads, &DownloadManager::finished, this,
            [this, mine](const QString& id, const QString& path) {
                if (mine(id) && m_state == State::Downloading) extract(path);
            });
    connect(m_downloads, &DownloadManager::failed, this,
            [this, mine](const QString& id, const QString& error) {
                if (mine(id)) fail(error);
            });
    connect(m_downloads, &DownloadManager::cancelled, this,
            [this, mine](const QString& id) {
                if (!mine(id)) return;
                setState(State::Idle);
                emit cancelled();
            });
    connect(m_tar, &ProcessRunner::finished, this,
            [this](const ProcessResult& r) {
                finishExtract(m_paths->dataDir() + "/python-staging", r);
            });
}

} // namespace Hypernucleus
