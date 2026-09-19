#include "services/PathManager.h"

#include <QDir>
#include <QFileInfo>

namespace Hypernucleus {

QString PathManager::venvDir(const QString& gameName) const
{
    return pipTargetDir(gameName) + "/venv";
}

QString PathManager::venvPython(const QString& gameName) const
{
#ifdef Q_OS_WIN
    return venvDir(gameName) + "/Scripts/python.exe";
#else
    return venvDir(gameName) + "/bin/python";
#endif
}

bool PathManager::hasLegacyTarget(const QString& gameName) const
{
    const QDir dir(pipTargetDir(gameName));
    const QStringList left =
        dir.entryList(QDir::AllEntries | QDir::NoDotAndDotDot);
    return left.size() > (left.contains("venv") ? 1 : 0);
}

void PathManager::cleanLegacyTarget(const QString& gameName) const
{
    const QDir dir(pipTargetDir(gameName));
    for (const QFileInfo& fi :
         dir.entryInfoList(QDir::AllEntries | QDir::NoDotAndDotDot |
                           QDir::Hidden)) {
        if (fi.fileName() == "venv") continue;
        if (fi.isDir() && !fi.isSymLink())
            QDir(fi.absoluteFilePath()).removeRecursively();
        else
            QFile::remove(fi.absoluteFilePath());
    }
}

} // namespace Hypernucleus
