#include "services/GameManager.h"
#include "services/PathManager.h"
#include "services/ModuleInstaller.h"

#include <QDir>
#include <QFileInfo>
#include <QProcessEnvironment>

namespace Hypernucleus {

GameManager::GameManager(PathManager* pathManager, ModuleInstaller* installer,
                         QObject* parent)
    : QObject(parent)
    , m_pathManager(pathManager)
    , m_installer(installer)
{
}

GameManager::~GameManager()
{
    if (m_process && m_process->state() != QProcess::NotRunning) {
        m_process->kill();
        m_process->waitForFinished(3000);
    }
}

bool GameManager::isRunning() const
{
    return m_running;
}

QString GameManager::currentGame() const
{
    return m_currentGame;
}

void GameManager::launchGame(const QString& name, const QString& version,
                              const QJsonObject& revisionData)
{
    if (m_running) {
        emit gameError(name, "Another game is already running: " + m_currentGame);
        return;
    }

    QString gameDir = m_pathManager->gameDir(name, version);
    QDir dir(gameDir);
    if (!dir.exists()) {
        emit gameError(name, "Game directory does not exist. Install the game first.");
        return;
    }

    // Determine launch mode from revision data
    QString moduleType = revisionData.value("module_type").toString("folder");
    QJsonArray dependencies = revisionData.value("dependencies").toArray();

    // Clean up previous process
    if (m_process) {
        m_process->deleteLater();
        m_process = nullptr;
    }

    m_process = new QProcess(this);
    m_process->setWorkingDirectory(gameDir);

    // Merge environment
    QProcessEnvironment env = QProcessEnvironment::systemEnvironment();

    // Build PYTHONPATH from dependencies
    QStringList pythonPaths;
    buildPythonPath(dependencies, pythonPaths);
    if (!pythonPaths.isEmpty()) {
        QString existingPythonPath = env.value("PYTHONPATH");
        QString separator =
#ifdef Q_OS_WIN
            ";";
#else
            ":";
#endif
        if (!existingPythonPath.isEmpty()) {
            pythonPaths.append(existingPythonPath);
        }
        env.insert("PYTHONPATH", pythonPaths.join(separator));
    }

    m_process->setProcessEnvironment(env);

    // Connect process signals
    connect(m_process, &QProcess::started, this, [this, name]() {
        m_running = true;
        m_currentGame = name;
        emit runningChanged();
        emit currentGameChanged();
        emit gameStarted(name);
    });

    connect(m_process, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished),
            this, [this, name](int exitCode, QProcess::ExitStatus exitStatus) {
        m_running = false;
        QString stoppedGame = m_currentGame;
        m_currentGame.clear();
        emit runningChanged();
        emit currentGameChanged();

        if (exitStatus == QProcess::CrashExit) {
            emit gameError(stoppedGame, "Game crashed with exit code: "
                           + QString::number(exitCode));
        } else {
            emit gameStopped(stoppedGame);
        }
    });

    connect(m_process, &QProcess::errorOccurred,
            this, [this, name](QProcess::ProcessError error) {
        Q_UNUSED(error)
        m_running = false;
        m_currentGame.clear();
        emit runningChanged();
        emit currentGameChanged();
        emit gameError(name, m_process->errorString());
    });

    connect(m_process, &QProcess::readyReadStandardOutput, this, [this]() {
        QString output = QString::fromUtf8(m_process->readAllStandardOutput());
        emit gameOutput(output);
    });

    connect(m_process, &QProcess::readyReadStandardError, this, [this]() {
        QString output = QString::fromUtf8(m_process->readAllStandardError());
        emit gameOutput(output);
    });

    // Determine if this is a Python game or native executable
    // Check for common Python entry points
    bool isPython = false;
    QStringList pythonEntries = {"__main__.py", "main.py", name + ".py"};
    for (const QString& entry : pythonEntries) {
        if (QFileInfo::exists(gameDir + "/" + entry)) {
            isPython = true;

            // Launch with python -r (run as module) or python <script>
            QString pythonBin = "python3";
#ifdef Q_OS_WIN
            pythonBin = "python";
#endif
            if (entry == "__main__.py") {
                m_process->start(pythonBin, {"-m", name});
            } else {
                m_process->start(pythonBin, {entry});
            }
            return;
        }
    }

    // Native executable
    if (!isPython) {
        QString executable = findExecutable(gameDir, name);
        if (executable.isEmpty()) {
            emit gameError(name, "No executable found in game directory");
            return;
        }
        m_process->start(executable, {});
    }
}

void GameManager::stopGame()
{
    if (!m_process || !m_running)
        return;

    m_process->terminate();
    if (!m_process->waitForFinished(5000)) {
        m_process->kill();
        m_process->waitForFinished(3000);
    }
}

void GameManager::buildPythonPath(const QJsonArray& dependencies,
                                   QStringList& paths)
{
    for (const auto& depVal : dependencies) {
        QJsonObject depObj = depVal.toObject();
        QString depName = depObj.value("name").toString();
        QString depVersion = m_installer->installedVersion(depName);
        if (!depVersion.isEmpty()) {
            QString depPath = m_pathManager->depDir(depName, depVersion);
            if (QDir(depPath).exists()) {
                paths.append(depPath);
            }
        }
    }
}

QString GameManager::findExecutable(const QString& gameDir, const QString& name)
{
    QDir dir(gameDir);

    // Platform-specific executable names
    QStringList candidates;
#ifdef Q_OS_WIN
    candidates << name + ".exe" << name + ".bat" << name + ".cmd";
#elif defined(Q_OS_MACOS)
    candidates << name << name + ".app/Contents/MacOS/" + name;
#else
    candidates << name;
#endif

    for (const QString& candidate : candidates) {
        QString path = dir.filePath(candidate);
        QFileInfo fi(path);
        if (fi.exists() && fi.isExecutable()) {
            return path;
        }
    }

    // Fallback: look for any executable file in the directory
    QFileInfoList entries = dir.entryInfoList(QDir::Files | QDir::Executable);
    if (!entries.isEmpty()) {
        return entries.first().absoluteFilePath();
    }

    return {};
}

} // namespace Hypernucleus
