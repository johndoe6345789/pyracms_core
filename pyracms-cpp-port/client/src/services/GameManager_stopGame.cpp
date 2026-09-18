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

void GameManager::stopGame()
{
    if (!m_process || !m_running) return;
    m_stopRequested = true;
    m_process->terminate();
    if (!m_process->waitForFinished(5000)) {
        m_process->kill();
        m_process->waitForFinished(3000);
    }
}

} // namespace Hypernucleus
