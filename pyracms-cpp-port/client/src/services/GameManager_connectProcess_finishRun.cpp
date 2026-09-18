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

void GameManager::finishRun()
{
    const bool wasRunning = m_running;
    m_running = false;
    m_currentGame.clear();
    m_logFile.close();
    if (wasRunning) {
        emit runningChanged();
        emit currentGameChanged();
    }
}

} // namespace Hypernucleus
