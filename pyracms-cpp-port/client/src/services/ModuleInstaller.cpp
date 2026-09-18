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

ModuleInstaller::ModuleInstaller(ApiClient* apiClient, PathManager* pathManager,
                                 QObject* parent)
    : QObject(parent), m_apiClient(apiClient), m_pathManager(pathManager),
      m_downloads(new DownloadManager(apiClient, this)),
      m_store(pathManager->stateFile())
{
    m_store.load();
    // First run after upgrading from the original Hypernucleus client.
    if (m_store.count() == 0 &&
        m_store.importLegacyIni(m_pathManager->legacyIniFile(),
                                m_pathManager->gamesDir(),
                                m_pathManager->depsDir()) > 0) {
        m_store.save();
    }
    connectDownloads();
}

void ModuleInstaller::connectDownloads()
{
    connect(m_downloads, &DownloadManager::progress, this,
            [this](const QString& id, qint64 r, qint64 t) {
                emit downloadProgress(id, r, t);
            });
    connect(m_downloads, &DownloadManager::verifying, this,
            [this](const QString& id) { emit verifyStarted(id); });
    connect(
        m_downloads, &DownloadManager::finished, this,
        [this](const QString&, const QString& path) { performInstall(path); });
    connect(m_downloads, &DownloadManager::failed, this,
            [this](const QString& id, const QString& err) { fail(id, err); });
    connect(m_downloads, &DownloadManager::cancelled, this,
            [this](const QString& id) {
                m_hasJob = false;
                setBusy(false);
                emit installCancelled(id);
            });
}

bool ModuleInstaller::isBusy() const { return m_busy; }

QString ModuleInstaller::targetDirFor(const QString& name,
                                      const QString& type) const
{
    return type == "game" ? m_pathManager->gameDir(name)
                          : m_pathManager->depDir(name);
}

} // namespace Hypernucleus
