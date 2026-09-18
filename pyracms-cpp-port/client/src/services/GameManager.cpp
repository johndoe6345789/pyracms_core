#include "services/GameManager.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"
#include "services/PythonLocator.h"
#include "services/SettingsManager.h"
#include "domain/LaunchResolver.h"

#include <QDateTime>
#include <QDir>
#include <QFileInfo>
#include <QProcessEnvironment>

namespace Hypernucleus {

namespace {
constexpr int kMaxLogChars = 64 * 1024;
constexpr qint64 kEarlyExitMs =
    10000; // non-zero exit before this = launch failed
} // namespace

GameManager::GameManager(PathManager* pathManager, ModuleInstaller* installer,
                         QObject* parent)
    : QObject(parent), m_pathManager(pathManager), m_installer(installer),
      m_os(SettingsManager::detectOs())
{
}

GameManager::~GameManager()
{
    if (m_process && m_process->state() != QProcess::NotRunning) {
        m_process->disconnect(this);
        m_process->kill();
        m_process->waitForFinished(3000);
    }
}

bool GameManager::isRunning() const { return m_running; }
QString GameManager::currentGame() const { return m_currentGame; }

QString GameManager::logFilePath(const QString& gameName) const
{
    return m_pathManager->logsDir() + "/" + gameName + ".log";
}

void GameManager::append(const QString& text)
{
    if (text.isEmpty()) return;
    m_log = (m_log + text).right(kMaxLogChars);
    if (m_logFile.isOpen()) {
        m_logFile.write(text.toUtf8());
        m_logFile.flush();
    }
    emit gameOutput(text);
    emit logChanged();
}

} // namespace Hypernucleus
