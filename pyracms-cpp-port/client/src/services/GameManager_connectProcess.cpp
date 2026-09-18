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
                    return; // Crashed is reported by finished()
                m_errorReported = true;
                const QString msg =
                    "Could not start the game: " + m_process->errorString();
                append(msg + "\n");
                finishRun();
                emit gameError(name, msg);
            });

    connect(m_process,
            QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished), this,
            [this, name](int exitCode, QProcess::ExitStatus status) {
                if (m_errorReported) return;
                const qint64 ranMs = m_runTime.elapsed();
                append(QString::fromUtf8(m_process->readAllStandardOutput()));
                finishRun();
                if (m_stopRequested) {
                    emit gameStopped(name);
                } else if (status == QProcess::CrashExit) {
                    emit gameError(
                        name, "The game crashed (see the log for details)");
                } else if (exitCode != 0 && ranMs < kEarlyExitMs) {
                    emit gameError(
                        name, QStringLiteral(
                                  "The game exited immediately with code %1 "
                                  "(see the log for details)")
                                  .arg(exitCode));
                } else {
                    emit gameStopped(name);
                }
            });
}

} // namespace Hypernucleus
