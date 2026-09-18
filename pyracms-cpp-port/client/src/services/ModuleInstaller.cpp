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

ModuleInstaller::ModuleInstaller(ApiClient* apiClient, PathManager* pathManager,
                                 QObject* parent)
    : QObject(parent)
    , m_apiClient(apiClient)
    , m_pathManager(pathManager)
    , m_downloads(new DownloadManager(apiClient, this))
    , m_store(pathManager->stateFile())
{
    m_store.load();
    // First run after upgrading from the original Hypernucleus client.
    if (m_store.count() == 0
        && m_store.importLegacyIni(m_pathManager->legacyIniFile(),
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
    connect(m_downloads, &DownloadManager::finished, this,
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

bool ModuleInstaller::isBusy() const
{
    return m_busy;
}

QString ModuleInstaller::targetDirFor(const QString& name, const QString& type) const
{
    return type == "game" ? m_pathManager->gameDir(name)
                          : m_pathManager->depDir(name);
}

void ModuleInstaller::install(const QString& name, const QString& version,
                              const QJsonObject& revisionData,
                              const QString& type)
{
    if (m_busy) {
        emit installFailed(name, "Another installation is in progress");
        return;
    }
    const InstallRecord existing = m_store.get(name);
    if (existing.isValid() && existing.version == version
        && QDir(existing.path).exists()) {
        emit installComplete(name, version);
        return;
    }

    setBusy(true);
    const DownloadTarget target = DownloadTarget::fromJson(revisionData);
    if (!target.ok) {
        fail(name, "No file UUID in revision data");
        return;
    }

    m_job = Job{name, version, type, target,
                m_pathManager->archivePath(
                    safeFileName(type + "-" + name + "-" + version) + ".zip")};
    m_hasJob = true;
    emit installStarted(name);

    DownloadManager::Request req;
    req.id = name;
    req.url = target.url.isEmpty()
        ? m_apiClient->resolveUrl(QStringLiteral("/api/files/")
                                + QString::fromLatin1(QUrl::toPercentEncoding(target.fileRef)))
        : m_apiClient->resolveUrl(target.url);
    req.destPath = m_job.archivePath;
    req.expectedSize = target.size;
    req.expectedSha256 = target.sha256;
    m_downloads->start(req);
}

void ModuleInstaller::cancel()
{
    if (m_hasJob)
        m_downloads->cancel(m_job.name);
}

void ModuleInstaller::fail(const QString& name, const QString& error)
{
    m_hasJob = false;
    setBusy(false);
    emit installFailed(name, error);
}

void ModuleInstaller::performInstall(const QString& archivePath)
{
    if (!m_hasJob)
        return;
    const Job job = m_job;
    emit extractionStarted(job.name);

    const QString targetDir = targetDirFor(job.name, job.type);
    const QString staging = targetDir + ".partial";
    ExtractResult result;

    if (ArchiveExtractor::looksLikeZip(archivePath)) {
        result = ArchiveExtractor::extractZip(archivePath, staging);
        if (result.ok)
            result = ArchiveExtractor::installLayout(staging, targetDir, job.name);
    } else {
        // A single file (native binary or one-file python module).
        QDir(staging).removeRecursively();
        QDir().mkpath(staging);
        QString fileName = QFileInfo(job.target.executable).fileName();
        if (fileName.isEmpty())
            fileName = QFileInfo(QUrl(job.target.url).path()).fileName();
        if (fileName.isEmpty())
            fileName = job.name;
        const QString dest = staging + "/" + fileName;
        if (QFile::copy(archivePath, dest)) {
            QFile::setPermissions(dest, QFile::permissions(dest) | QFile::ExeOwner
                                        | QFile::ExeGroup | QFile::ExeOther);
            result = ArchiveExtractor::installLayout(staging, targetDir, job.name);
        } else {
            result.error = "Could not copy downloaded file";
        }
    }
    if (!result.ok) {
        QDir(staging).removeRecursively();
        fail(job.name, result.error);
        return;
    }

    InstallRecord rec;
    rec.name = job.name;
    rec.version = job.version;
    rec.type = job.type;
    rec.path = targetDir;
    rec.moduleType = job.target.moduleType;
    rec.kind = job.target.nativeBuild ? "native" : "python";
    rec.executable = job.target.executable;
    rec.sizeBytes = result.bytes;
    m_store.set(rec);
    saveState();

    QFile::remove(archivePath);   // the module is extracted, save disk space
    m_hasJob = false;
    setBusy(false);
    emit installComplete(job.name, job.version);
    emit installStateChanged();
}

void ModuleInstaller::uninstall(const QString& name, const QString& version,
                                const QString& type)
{
    if (!m_store.contains(name)) {
        emit uninstallFailed(name, "Module is not installed");
        return;
    }
    const InstallRecord rec = m_store.get(name);
    QString dir = rec.path.isEmpty() ? targetDirFor(name, type.isEmpty() ? rec.type : type)
                                     : rec.path;
    Q_UNUSED(version)

    if (!removeDirectory(dir)) {
        emit uninstallFailed(name, "Failed to remove installation directory");
        return;
    }
    if (rec.type == "game")
        removeDirectory(m_pathManager->pipTargetDir(name));

    m_store.remove(name);
    saveState();
    emit uninstallComplete(name);
    emit installStateChanged();
}

bool ModuleInstaller::isInstalled(const QString& name) const
{
    return m_store.contains(name);
}

QString ModuleInstaller::installedVersion(const QString& name) const
{
    return m_store.version(name);
}

QMap<QString, QString> ModuleInstaller::installedVersions() const
{
    return m_store.versions();
}

InstallRecord ModuleInstaller::record(const QString& name) const
{
    return m_store.get(name);
}

QMap<QString, InstallRecord> ModuleInstaller::installedRecords() const
{
    QMap<QString, InstallRecord> out;
    for (const QString& n : m_store.names())
        out.insert(n, m_store.get(n));
    return out;
}

QString ModuleInstaller::installPath(const QString& name) const
{
    return m_store.get(name).path;
}

void ModuleInstaller::annotate(const QString& name, const QStringList& deps,
                               const QStringList& pipSpecs)
{
    if (!m_store.contains(name))
        return;
    InstallRecord rec = m_store.get(name);
    rec.deps = deps;
    rec.pipSpecs = pipSpecs;
    m_store.set(rec);
    saveState();
}

void ModuleInstaller::saveState()
{
    m_store.save();
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
            if (m_store.version(depName) == depVersion && !depVersion.isEmpty())
                continue;

            QJsonObject depsSection = catalog.value("dependencies").toObject();
            if (depsSection.contains(depName)) {
                QJsonObject depCatalogEntry = depsSection[depName].toObject();
                QJsonArray subDeps = depCatalogEntry.value("dependencies").toArray();
                if (!subDeps.isEmpty())
                    resolve(subDeps);
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

bool ModuleInstaller::removeDirectory(const QString& path)
{
    QDir dir(path);
    if (!dir.exists())
        return true;
    return dir.removeRecursively();
}

} // namespace Hypernucleus
