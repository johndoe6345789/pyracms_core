#include "services/ModuleInstaller.h"
#include "services/ApiClient.h"
#include "services/PathManager.h"

#include <QDir>
#include <QFile>
#include <QSettings>
#include <QTemporaryFile>

// QuaZip headers
#include <quazip/quazip.h>
#include <quazip/quazipfile.h>

namespace Hypernucleus {

ModuleInstaller::ModuleInstaller(ApiClient* apiClient, PathManager* pathManager,
                                 QObject* parent)
    : QObject(parent)
    , m_apiClient(apiClient)
    , m_pathManager(pathManager)
{
    loadInstalledState();

    // Handle file downloads completing
    connect(m_apiClient, &ApiClient::fileFetched,
            this, [this](const QString& uuid, const QByteArray& data) {
        // Find the pending install matching this UUID
        for (int i = 0; i < m_pendingInstalls.size(); ++i) {
            const auto& pending = m_pendingInstalls[i];
            QJsonObject info = pending.second;
            if (info.value("uuid").toString() == uuid) {
                QString name = pending.first;
                QString version = info.value("version").toString();
                QString type = info.value("type").toString();
                m_pendingInstalls.removeAt(i);
                performExtraction(name, version, type, data);
                return;
            }
        }
    });

    connect(m_apiClient, &ApiClient::downloadProgress,
            this, [this](const QString& uuid, qint64 received, qint64 total) {
        // Map UUID back to name for the signal
        for (const auto& pending : m_pendingInstalls) {
            QJsonObject info = pending.second;
            if (info.value("uuid").toString() == uuid) {
                emit downloadProgress(pending.first, received, total);
                return;
            }
        }
    });
}

bool ModuleInstaller::isBusy() const
{
    return m_busy;
}

void ModuleInstaller::install(const QString& name, const QString& version,
                               const QJsonObject& revisionData,
                               const QString& type)
{
    if (m_installed.contains(name) && m_installed[name] == version) {
        emit installComplete(name, version);
        return;
    }

    setBusy(true);

    // Get the file UUID for this revision
    QString fileUuid = revisionData.value("file_uuid").toString();
    if (fileUuid.isEmpty()) {
        emit installFailed(name, "No file UUID in revision data");
        setBusy(false);
        return;
    }

    // Queue the install
    QJsonObject info;
    info["version"] = version;
    info["type"] = type;
    info["uuid"] = fileUuid;
    info["revisionData"] = revisionData;
    m_pendingInstalls.append({name, info});

    // Start download
    m_apiClient->fetchFile(fileUuid);
}

void ModuleInstaller::uninstall(const QString& name, const QString& version,
                                 const QString& type)
{
    if (!m_installed.contains(name)) {
        emit uninstallFailed(name, "Module is not installed");
        return;
    }

    QString targetDir;
    if (type == "game") {
        targetDir = m_pathManager->gameDir(name, version);
    } else {
        targetDir = m_pathManager->depDir(name, version);
    }

    if (!removeDirectory(targetDir)) {
        emit uninstallFailed(name, "Failed to remove installation directory");
        return;
    }

    m_installed.remove(name);
    saveInstalledState();
    emit uninstallComplete(name);
}

bool ModuleInstaller::isInstalled(const QString& name) const
{
    return m_installed.contains(name);
}

QString ModuleInstaller::installedVersion(const QString& name) const
{
    return m_installed.value(name);
}

QMap<QString, QString> ModuleInstaller::installedVersions() const
{
    return m_installed;
}

QList<QPair<QString, QString>> ModuleInstaller::resolveDependencies(
    const QJsonArray& dependencies, const QJsonObject& catalog) const
{
    QList<QPair<QString, QString>> result;
    QSet<QString> visited;

    std::function<void(const QJsonArray&)> resolve = [&](const QJsonArray& deps) {
        for (const auto& depVal : deps) {
            QJsonObject depObj = depVal.toObject();
            QString depName = depObj.value("name").toString();
            QString depVersion = depObj.value("version").toString();

            if (visited.contains(depName))
                continue;
            visited.insert(depName);

            // Skip already installed deps with correct version
            if (m_installed.contains(depName) && m_installed[depName] == depVersion)
                continue;

            // Recursively resolve this dep's own dependencies
            QJsonObject depsSection = catalog.value("dependencies").toObject();
            if (depsSection.contains(depName)) {
                QJsonObject depCatalogEntry = depsSection[depName].toObject();
                QJsonArray subDeps = depCatalogEntry.value("dependencies").toArray();
                if (!subDeps.isEmpty()) {
                    resolve(subDeps);
                }
            }

            result.append({depName, depVersion});
        }
    };

    resolve(dependencies);
    return result;
}

void ModuleInstaller::setBusy(bool busy)
{
    if (m_busy == busy)
        return;
    m_busy = busy;
    emit busyChanged();
}

void ModuleInstaller::performExtraction(const QString& name, const QString& version,
                                         const QString& type, const QByteArray& archiveData)
{
    emit extractionStarted(name);

    // Determine target directory
    QString targetDir;
    if (type == "game") {
        targetDir = m_pathManager->gameDir(name, version);
    } else {
        targetDir = m_pathManager->depDir(name, version);
    }

    QDir dir;
    if (!dir.mkpath(targetDir)) {
        emit installFailed(name, "Failed to create installation directory: " + targetDir);
        setBusy(false);
        return;
    }

    // Write archive to temporary file for QuaZip
    QTemporaryFile tempFile;
    tempFile.setAutoRemove(true);
    if (!tempFile.open()) {
        emit installFailed(name, "Failed to create temporary file");
        setBusy(false);
        return;
    }
    tempFile.write(archiveData);
    tempFile.flush();

    // Extract using QuaZip
    QuaZip zip(tempFile.fileName());
    if (!zip.open(QuaZip::mdUnzip)) {
        emit installFailed(name, "Failed to open archive: " + zip.getZipError());
        setBusy(false);
        return;
    }

    QuaZipFile zipFile(&zip);
    for (bool more = zip.goToFirstFile(); more; more = zip.goToNextFile()) {
        QString entryName = zip.getCurrentFileName();
        QString outputPath = targetDir + "/" + entryName;

        if (entryName.endsWith('/')) {
            // Directory entry
            dir.mkpath(outputPath);
            continue;
        }

        // Ensure parent directory exists
        QFileInfo fi(outputPath);
        dir.mkpath(fi.absolutePath());

        if (!zipFile.open(QIODevice::ReadOnly)) {
            zip.close();
            emit installFailed(name, "Failed to read archive entry: " + entryName);
            setBusy(false);
            return;
        }

        QFile outFile(outputPath);
        if (!outFile.open(QIODevice::WriteOnly)) {
            zipFile.close();
            zip.close();
            emit installFailed(name, "Failed to write file: " + outputPath);
            setBusy(false);
            return;
        }

        // Stream extraction in chunks
        constexpr qint64 CHUNK_SIZE = 65536;
        while (!zipFile.atEnd()) {
            QByteArray chunk = zipFile.read(CHUNK_SIZE);
            outFile.write(chunk);
        }

        outFile.close();
        zipFile.close();

        // Preserve executable permissions on Unix
#ifndef Q_OS_WIN
        QuaZipFileInfo64 fileInfo;
        if (zip.getCurrentFileInfo(&fileInfo)) {
            quint32 externalAttr = fileInfo.externalAttr;
            // Unix permissions are in the high 16 bits
            quint32 unixPerms = (externalAttr >> 16) & 0xFFFF;
            if (unixPerms & 0111) {
                // Has execute bit set
                outFile.setPermissions(outFile.permissions() | QFile::ExeOwner
                                       | QFile::ExeGroup | QFile::ExeOther);
            }
        }
#endif
    }

    zip.close();

    // Record as installed
    m_installed[name] = version;
    saveInstalledState();

    setBusy(false);
    emit installComplete(name, version);
}

void ModuleInstaller::saveInstalledState()
{
    QSettings settings;
    settings.beginGroup("installed_modules");
    settings.remove(""); // Clear the group
    for (auto it = m_installed.cbegin(); it != m_installed.cend(); ++it) {
        settings.setValue(it.key(), it.value());
    }
    settings.endGroup();
    settings.sync();
}

void ModuleInstaller::loadInstalledState()
{
    QSettings settings;
    settings.beginGroup("installed_modules");
    for (const QString& key : settings.childKeys()) {
        m_installed[key] = settings.value(key).toString();
    }
    settings.endGroup();
}

bool ModuleInstaller::removeDirectory(const QString& path)
{
    QDir dir(path);
    if (!dir.exists())
        return true;
    return dir.removeRecursively();
}

} // namespace Hypernucleus
