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

void ModuleInstaller::uninstall(const QString& name, const QString& version,
                                const QString& type)
{
    if (!m_store.contains(name)) {
        emit uninstallFailed(name, tr("Module is not installed"));
        return;
    }
    const InstallRecord rec = m_store.get(name);
    QString dir = rec.path.isEmpty()
                      ? targetDirFor(name, type.isEmpty() ? rec.type : type)
                      : rec.path;
    Q_UNUSED(version)

    if (!removeDirectory(dir)) {
        emit uninstallFailed(
            name, tr("Failed to remove installation directory"));
        return;
    }
    if (rec.type == "game") removeDirectory(m_pathManager->pipTargetDir(name));

    m_store.remove(name);
    removeOrphans(rec);
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

} // namespace Hypernucleus
