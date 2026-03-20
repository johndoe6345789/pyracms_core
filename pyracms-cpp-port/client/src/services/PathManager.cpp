#include "services/PathManager.h"

#include <QDir>
#include <QStandardPaths>

namespace Hypernucleus {

PathManager::PathManager(QObject* parent)
    : QObject(parent)
{
    m_dataDir = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation)
                + "/Hypernucleus";
    m_gamesDir = m_dataDir + "/games";
    m_depsDir = m_dataDir + "/deps";
    m_picturesDir = m_dataDir + "/pictures";
    m_archivesDir = m_dataDir + "/archives";

    ensureDirectories();
}

QString PathManager::dataDir() const { return m_dataDir; }
QString PathManager::gamesDir() const { return m_gamesDir; }
QString PathManager::depsDir() const { return m_depsDir; }
QString PathManager::picturesDir() const { return m_picturesDir; }
QString PathManager::archivesDir() const { return m_archivesDir; }

QString PathManager::gameDir(const QString& name, const QString& version) const
{
    return m_gamesDir + "/" + name + "/" + version;
}

QString PathManager::depDir(const QString& name, const QString& version) const
{
    return m_depsDir + "/" + name + "/" + version;
}

QString PathManager::archivePath(const QString& filename) const
{
    return m_archivesDir + "/" + filename;
}

void PathManager::ensureDirectories()
{
    QDir dir;
    dir.mkpath(m_dataDir);
    dir.mkpath(m_gamesDir);
    dir.mkpath(m_depsDir);
    dir.mkpath(m_picturesDir);
    dir.mkpath(m_archivesDir);
}

} // namespace Hypernucleus
