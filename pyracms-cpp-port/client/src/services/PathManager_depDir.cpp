#include "services/PathManager.h"

#include <QDir>
#include <QStandardPaths>

namespace Hypernucleus {

QString PathManager::depDir(const QString& name,
                            const QString& /*version*/) const
{
    return depsDir() + "/" + name;
}

QString PathManager::pipTargetDir(const QString& gameName) const
{
    return pylibsDir() + "/" + gameName;
}

QString PathManager::archivePath(const QString& filename) const
{
    return archivesDir() + "/" + filename;
}

void PathManager::apply(const QString& dir)
{
    m_dataDir = QDir::cleanPath(dir);
    ensureDirectories();
}

void PathManager::ensureDirectories()
{
    QDir dir;
    for (const QString& p :
         {m_dataDir, m_configDir, gamesDir(), depsDir(), picturesDir(),
          archivesDir(), logsDir(), pylibsDir()})
        dir.mkpath(p);
}

} // namespace Hypernucleus
