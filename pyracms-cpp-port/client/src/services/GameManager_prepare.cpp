#include "services/GameManager.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"
#include "services/PythonLocator.h"
#include "domain/LaunchResolver.h"

#include <QDateTime>
#include <QDir>
#include <QFileInfo>
#include <QProcessEnvironment>

namespace Hypernucleus {

bool GameManager::prepareNative(const InstallRecord& rec, QString& program)
{
    program = LaunchResolver::findNativeExecutable(rec.path, rec.name,
                                                   rec.executable, m_os);
    if (!program.isEmpty()) return true;
    emit gameError(
        rec.name,
        rec.executable.isEmpty()
            ? tr("No executable for %1 found in the game folder")
                  .arg(m_os)
            : tr("Executable '%1' not found in the game folder")
                  .arg(rec.executable));
    return false;
}

bool GameManager::preparePython(const InstallRecord& rec, QString& program,
                                QStringList& args, QProcessEnvironment& env)
{
    // A game with pip packages runs inside its own venv.
    const bool hasVenv = QFileInfo::exists(m_pathManager->venvPython(rec.name));
    const PythonInfo py =
        PythonLocator::find(m_pythonPath, m_pathManager->dataDir());
    if (!hasVenv && !py.found()) {
        emit pythonMissing(rec.name);
        emit gameError(rec.name,
                       tr("Python was not found. Install Python 3 or set its "
                          "location in Settings."));
        return false;
    }
    program = hasVenv ? m_pathManager->venvPython(rec.name) : py.exe;
    if (!hasVenv) args = py.prefix;
    args << "-u" << "-c" << LaunchResolver::pythonBootstrapScript()
         << rec.name << rec.path;
    QStringList entries = LaunchResolver::pythonPathEntries(
        rec, m_installer->installedRecords(),
        hasVenv ? QString() : m_pathManager->pipTargetDir(rec.name));
    const QString existing = env.value("PYTHONPATH");
    if (!existing.isEmpty()) entries << existing;
    env.insert("PYTHONPATH", entries.join(QDir::listSeparator()));
    env.insert("PYTHONUNBUFFERED", "1");
    return true;
}

void GameManager::openLog(const InstallRecord& rec)
{
    if (m_process) {
        m_process->deleteLater();
        m_process = nullptr;
    }
    m_log.clear();
    emit logChanged();
    m_logFile.close();
    m_logFile.setFileName(logFilePath(rec.name));
    QDir().mkpath(QFileInfo(m_logFile.fileName()).absolutePath());
    if (m_logFile.open(QIODevice::WriteOnly | QIODevice::Append)) {
        m_logFile.write(
            QStringLiteral("\n--- launch %1 (%2) ---\n")
                .arg(QDateTime::currentDateTime().toString(Qt::ISODate),
                     rec.version)
                .toUtf8());
    }
}

} // namespace Hypernucleus
