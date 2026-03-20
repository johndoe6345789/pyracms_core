#pragma once

#include <QObject>
#include <QJsonObject>
#include <QJsonArray>
#include <QMap>
#include <QSet>
#include <QString>

namespace Hypernucleus {

class ApiClient;
class PathManager;

class ModuleInstaller : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool busy READ isBusy NOTIFY busyChanged)

public:
    explicit ModuleInstaller(ApiClient* apiClient, PathManager* pathManager,
                             QObject* parent = nullptr);

    bool isBusy() const;

    // Install a module (game or dep) with its revision data
    Q_INVOKABLE void install(const QString& name, const QString& version,
                              const QJsonObject& revisionData,
                              const QString& type);

    // Uninstall a module
    Q_INVOKABLE void uninstall(const QString& name, const QString& version,
                                const QString& type);

    // Query installed state
    Q_INVOKABLE bool isInstalled(const QString& name) const;
    Q_INVOKABLE QString installedVersion(const QString& name) const;
    QMap<QString, QString> installedVersions() const;

    // Resolve dependencies recursively
    QList<QPair<QString, QString>> resolveDependencies(
        const QJsonArray& dependencies, const QJsonObject& catalog) const;

signals:
    void busyChanged();
    void downloadProgress(const QString& name, qint64 received, qint64 total);
    void extractionStarted(const QString& name);
    void installComplete(const QString& name, const QString& version);
    void installFailed(const QString& name, const QString& error);
    void uninstallComplete(const QString& name);
    void uninstallFailed(const QString& name, const QString& error);

private:
    void setBusy(bool busy);
    void performExtraction(const QString& name, const QString& version,
                           const QString& type, const QByteArray& archiveData);
    void saveInstalledState();
    void loadInstalledState();
    bool removeDirectory(const QString& path);

    ApiClient* m_apiClient;
    PathManager* m_pathManager;
    bool m_busy = false;

    // Tracks installed modules: name -> version
    QMap<QString, QString> m_installed;
    // Pending installs queue: name -> {version, revisionData, type}
    QList<QPair<QString, QJsonObject>> m_pendingInstalls;
    bool m_processingQueue = false;
};

} // namespace Hypernucleus
