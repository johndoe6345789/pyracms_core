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
constexpr qint64 kEarlyExitMs = 10000;   // non-zero exit before this = launch failed
}

GameManager::GameManager(PathManager* pathManager, ModuleInstaller* installer,
                         QObject* parent)
    : QObject(parent)
    , m_pathManager(pathManager)
    , m_installer(installer)
    , m_os(SettingsManager::detectOs())
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
    if (text.isEmpty())
        return;
    m_log = (m_log + text).right(kMaxLogChars);
    if (m_logFile.isOpen()) {
        m_logFile.write(text.toUtf8());
        m_logFile.flush();
    }
    emit gameOutput(text);
    emit logChanged();
}

void GameManager::launchGame(const QString& name)
{
    if (m_running) {
        emit gameError(name, "Another game is already running: " + m_currentGame);
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

    if (rec.kind == "native") {
        program = LaunchResolver::findNativeExecutable(rec.path, name, rec.executable, m_os);
        if (program.isEmpty()) {
            emit gameError(name, rec.executable.isEmpty()
                ? QStringLiteral("No executable for %1 found in the game folder").arg(m_os)
                : QStringLiteral("Executable '%1' not found in the game folder").arg(rec.executable));
            return;
        }
    } else {
        const PythonInfo py = PythonLocator::find(m_pythonPath, m_pathManager->dataDir());
        if (!py.found()) {
            emit gameError(name, "Python was not found. Install Python 3 or set its "
                                 "location in Settings.");
            return;
        }
        program = py.exe;
        args = py.prefix;
        args << "-u" << "-c" << LaunchResolver::pythonBootstrapScript() << name << rec.path;

        QStringList entries = LaunchResolver::pythonPathEntries(
            rec, m_installer->installedRecords(), m_pathManager->pipTargetDir(name));
        const QString existing = env.value("PYTHONPATH");
        if (!existing.isEmpty())
            entries << existing;
        env.insert("PYTHONPATH", entries.join(QDir::listSeparator()));
        env.insert("PYTHONUNBUFFERED", "1");
    }

    if (m_process) {
        m_process->deleteLater();
        m_process = nullptr;
    }
    m_log.clear();
    emit logChanged();
    m_logFile.close();
    m_logFile.setFileName(logFilePath(name));
    QDir().mkpath(QFileInfo(m_logFile.fileName()).absolutePath());
    if (m_logFile.open(QIODevice::WriteOnly | QIODevice::Append)) {
        m_logFile.write(QStringLiteral("\n--- launch %1 (%2) ---\n")
                            .arg(QDateTime::currentDateTime().toString(Qt::ISODate), rec.version)
                            .toUtf8());
    }

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

void GameManager::connectProcess(const QString& name)
{
    connect(m_process, &QProcess::started, this, [this, name]() {
        m_running = true;
        m_currentGame = name;
        emit runningChanged();
        emit currentGameChanged();
        emit gameStarted(name);
    });

    connect(m_process, &QProcess::readyReadStandardOutput, this, [this]() {
        append(QString::fromUtf8(m_process->readAllStandardOutput()));
    });

    connect(m_process, &QProcess::errorOccurred, this,
            [this, name](QProcess::ProcessError error) {
        if (error != QProcess::FailedToStart)
            return;   // Crashed is reported by finished()
        m_errorReported = true;
        const QString msg = "Could not start the game: " + m_process->errorString();
        append(msg + "\n");
        finishRun();
        emit gameError(name, msg);
    });

    connect(m_process, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished),
            this, [this, name](int exitCode, QProcess::ExitStatus status) {
        if (m_errorReported)
            return;
        const qint64 ranMs = m_runTime.elapsed();
        append(QString::fromUtf8(m_process->readAllStandardOutput()));
        finishRun();
        if (m_stopRequested) {
            emit gameStopped(name);
        } else if (status == QProcess::CrashExit) {
            emit gameError(name, "The game crashed (see the log for details)");
        } else if (exitCode != 0 && ranMs < kEarlyExitMs) {
            emit gameError(name, QStringLiteral("The game exited immediately with code %1 "
                                                "(see the log for details)").arg(exitCode));
        } else {
            emit gameStopped(name);
        }
    });
}

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

void GameManager::stopGame()
{
    if (!m_process || !m_running)
        return;
    m_stopRequested = true;
    m_process->terminate();
    if (!m_process->waitForFinished(5000)) {
        m_process->kill();
        m_process->waitForFinished(3000);
    }
}

} // namespace Hypernucleus
