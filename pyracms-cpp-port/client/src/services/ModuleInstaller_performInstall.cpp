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

void ModuleInstaller::performInstall(const QString& archivePath)
{
    if (!m_hasJob) return;
    const InstallJob job = m_job;
    emit extractionStarted(job.name);

    const QString targetDir = targetDirFor(job.name, job.type);
    const QString staging = targetDir + ".partial";
    ExtractResult result;

    if (ArchiveExtractor::looksLikeZip(archivePath)) {
        result = ArchiveExtractor::extractZip(archivePath, staging);
        if (result.ok)
            result =
                ArchiveExtractor::installLayout(staging, targetDir, job.name);
    } else {
        // A single file (native binary or one-file python module).
        QDir(staging).removeRecursively();
        QDir().mkpath(staging);
        QString fileName = QFileInfo(job.target.executable).fileName();
        if (fileName.isEmpty())
            fileName = QFileInfo(QUrl(job.target.url).path()).fileName();
        if (fileName.isEmpty()) fileName = job.name;
        const QString dest = staging + "/" + fileName;
        if (QFile::copy(archivePath, dest)) {
            QFile::setPermissions(dest, QFile::permissions(dest) |
                                            QFile::ExeOwner | QFile::ExeGroup |
                                            QFile::ExeOther);
            result =
                ArchiveExtractor::installLayout(staging, targetDir, job.name);
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

    QFile::remove(archivePath); // the module is extracted, save disk space
    m_hasJob = false;
    setBusy(false);
    emit installComplete(job.name, job.version);
    emit installStateChanged();
}

} // namespace Hypernucleus
