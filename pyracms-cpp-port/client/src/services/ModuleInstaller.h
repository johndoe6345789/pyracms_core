#pragma once

#include <QObject>
#include <QJsonObject>
#include <QJsonArray>
#include <QMap>
#include <QString>

#include "domain/InstallJob.h"
#include "domain/InstallStateStore.h"

namespace Hypernucleus {

class ApiClient;
class PathManager;
class DownloadManager;

// One module at a time: download -> extract -> record (see InstallRunner).
class ModuleInstaller : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool busy READ isBusy NOTIFY busyChanged)

public:
    explicit ModuleInstaller(ApiClient* apiClient, PathManager* pathManager,
                             QObject* parent = nullptr);
    bool isBusy() const;
    // revisionData: DownloadTarget::toJson() (legacy file_uuid works too)
    Q_INVOKABLE void install(const QString& name, const QString& version,
                             const QJsonObject& revisionData,
                             const QString& type);
    Q_INVOKABLE void cancel();
    Q_INVOKABLE void uninstall(const QString& name, const QString& version,
                               const QString& type);
    // Query installed state
    Q_INVOKABLE bool isInstalled(const QString& name) const;
    Q_INVOKABLE QString installedVersion(const QString& name) const;
    QMap<QString, QString> installedVersions() const;
    InstallRecord record(const QString& name) const;
    QMap<QString, InstallRecord> installedRecords() const;
    QString installPath(const QString& name) const;
    // Remember a game's dependency modules / pip specs for offline launch.
    void annotate(const QString& name, const QStringList& deps,
                  const QStringList& pipSpecs);
    // Legacy JSON-catalog resolver (see DependencyResolver).
    QList<QPair<QString, QString>>
    resolveDependencies(const QJsonArray& dependencies,
                        const QJsonObject& catalog) const;

signals:
    void busyChanged();
    void installStarted(const QString& name);
    void downloadProgress(const QString& name, qint64 received, qint64 total);
    void verifyStarted(const QString& name);
    void extractionStarted(const QString& name);
    void installComplete(const QString& name, const QString& version);
    void installFailed(const QString& name, const QString& error);
    void installCancelled(const QString& name);
    void uninstallComplete(const QString& name);
    void uninstallFailed(const QString& name, const QString& error);
    // A dependency module nobody needs any more was removed with its game.
    void orphanRemoved(const QString& name);
    void installStateChanged();

private:
    void setBusy(bool busy);
    void fail(const QString& name, const QString& error);
    void performInstall(const QString& archivePath);
    QString targetDirFor(const QString& name, const QString& type) const;
    bool removeDirectory(const QString& path);
    void saveState();
    // Dependency modules of `gone` that no installed module needs any more.
    QStringList orphansOf(const InstallRecord& gone) const;
    void removeOrphans(const InstallRecord& gone);
    void connectDownloads();
    ApiClient* m_apiClient;
    PathManager* m_pathManager;
    DownloadManager* m_downloads;
    InstallStateStore m_store;
    bool m_busy = false;
    bool m_hasJob = false;
    InstallJob m_job;
};

} // namespace Hypernucleus
