#include "services/GameManager.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

#include <QDir>
#include <QProcessEnvironment>

namespace Hypernucleus {

void GameManager::launchGame(const QString& name)
{
    if (m_running) {
        emit gameError(name,
                       "Another game is already running: " + m_currentGame);
        return;
    }
    const InstallRecord rec = m_installer->record(name);
    if (!rec.isValid() || !QDir(rec.path).exists()) {
        emit gameError(name, "The game is not installed. Install it first.");
        return;
    }

    QString program;
    QStringList args;
    QProcessEnvironment env = QProcessEnvironment::systemEnvironment();
    const bool ok = rec.kind == "native"
                        ? prepareNative(rec, program)
                        : preparePython(rec, program, args, env);
    if (!ok) return;

    openLog(rec);
    m_errorReported = false;
    m_stopRequested = false;
    m_process = new QProcess(this);
    m_process->setProcessEnvironment(env);
    m_process->setWorkingDirectory(rec.path);
    m_process->setProcessChannelMode(QProcess::MergedChannels);
    connectProcess(name);
    m_runTime.start();
    m_process->start(program, args);
}

} // namespace Hypernucleus
