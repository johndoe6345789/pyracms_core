#pragma once

#include <QObject>
#include <QJsonObject>
#include <QJsonArray>
#include <QMap>
#include <QSet>
#include <QString>

#include "domain/BinarySelector.h"
#include "domain/InstallStateStore.h"

namespace Hypernucleus {

class ApiClient;
class PathManager;
class DownloadManager;

// Installs one module (game or dependency) at a time: download (resumable,
// verified) -> extract -> record in installed.json. Sequencing of several
// modules (dependencies first) is done by InstallRunner.
class ModuleInstaller : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool busy READ isBusy NOTIFY busyChanged)

public:
    explicit ModuleInstaller(ApiClient* apiClient, PathManager* pathManager,
                             QObject* parent = nullptr);

    bool isBusy() const;

    // `revisionData` is a DownloadTarget::toJson() object; the legacy keys
    // file_uuid / fileUuid are still understood.
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

    // Remember which dependency modules / pip requirements belong to a
    // game so it can be launched later without the server.
    void annotate(const QString& name, const QStringList& deps,
                  const QStringList& pipSpecs);

    // Legacy JSON-catalog resolver (kept for compatibility, see
    // DependencyResolver for the current implementation).
    QList<QPair<QString, QString>> resolveDependencies(
        const QJsonArray& dependencies, const QJsonObject& catalog) const;

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
    void installStateChanged();

private:
    struct Job {
        QString name;
        QString version;
        QString type;
        DownloadTarget target;
        QString archivePath;
    };

    void setBusy(bool busy);
    void fail(const QString& name, const QString& error);
    void performInstall(const QString& archivePath);
    QString targetDirFor(const QString& name, const QString& type) const;
    bool removeDirectory(const QString& path);
    void saveState();
    void connectDownloads();

    ApiClient* m_apiClient;
    PathManager* m_pathManager;
    DownloadManager* m_downloads;
    InstallStateStore m_store;
    bool m_busy = false;
    bool m_hasJob = false;
    Job m_job;
};

} // namespace Hypernucleus
