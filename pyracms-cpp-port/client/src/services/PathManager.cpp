#include "services/PathManager.h"

#include <QDir>
#include <QStandardPaths>

namespace Hypernucleus {

PathManager::PathManager(QObject* parent)
    : QObject(parent)
{
    m_configDir = defaultDataDir();
    apply(m_configDir);
}

PathManager::PathManager(const QString& overrideDir, QObject* parent)
    : QObject(parent)
{
    const QString dir = overrideDir.isEmpty() ? defaultDataDir() : overrideDir;
    m_configDir = QDir::cleanPath(dir);
    apply(dir);
}

PathManager::PathManager(const QString& installRoot, const QString& configDir,
                         QObject* parent)
    : QObject(parent)
{
    m_configDir = QDir::cleanPath(configDir.isEmpty() ? defaultDataDir() : configDir);
    apply(installRoot.trimmed().isEmpty() ? m_configDir : installRoot);
}

QString PathManager::defaultDataDir()
{
#if defined(Q_OS_WIN)
    QString roaming = qEnvironmentVariable("APPDATA");
    if (roaming.isEmpty())
        roaming = QStandardPaths::writableLocation(QStandardPaths::GenericDataLocation);
    return QDir::cleanPath(roaming + "/hypernucleus/hypernucleus");
#elif defined(Q_OS_MACOS)
    return QDir::cleanPath(
        QStandardPaths::writableLocation(QStandardPaths::GenericDataLocation)
        + "/hypernucleus");
#else
    return QDir::cleanPath(
        QStandardPaths::writableLocation(QStandardPaths::GenericConfigLocation)
        + "/hypernucleus");
#endif
}

QString PathManager::dataDir() const { return m_dataDir; }
QString PathManager::configDir() const { return m_configDir; }
QString PathManager::gamesDir() const { return m_dataDir + "/games"; }
QString PathManager::depsDir() const { return m_dataDir + "/dependencies"; }
QString PathManager::picturesDir() const { return m_dataDir + "/pictures"; }
QString PathManager::archivesDir() const { return m_dataDir + "/archives"; }
QString PathManager::logsDir() const { return m_configDir + "/logs"; }
QString PathManager::pylibsDir() const { return m_dataDir + "/pylibs"; }
QString PathManager::stateFile() const { return m_configDir + "/installed.json"; }
QString PathManager::legacyIniFile() const { return m_configDir + "/config.ini"; }

void PathManager::setDataDir(const QString& dir)
{
    const QString target = dir.trimmed().isEmpty() ? m_configDir
                                                    : QDir::cleanPath(dir.trimmed());
    if (target == m_dataDir)
        return;
    apply(target);
    emit pathsChanged();
}

QString PathManager::gameDir(const QString& name, const QString& /*version*/) const
{
    return gamesDir() + "/" + name;
}

QString PathManager::depDir(const QString& name, const QString& /*version*/) const
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
    for (const QString& p : {m_dataDir, m_configDir, gamesDir(), depsDir(), picturesDir(),
                             archivesDir(), logsDir(), pylibsDir()})
        dir.mkpath(p);
}

} // namespace Hypernucleus
