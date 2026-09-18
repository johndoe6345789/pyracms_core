#include "services/PathManager.h"

#include <QDir>
#include <QStandardPaths>


namespace Hypernucleus {

QString PathManager::gameDir(const QString& name,
                             const QString& /*version*/) const
{
    return gamesDir() + "/" + name;
}

} // namespace Hypernucleus
