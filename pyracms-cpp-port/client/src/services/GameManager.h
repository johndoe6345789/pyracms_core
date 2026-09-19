#pragma once

#include <QElapsedTimer>
#include <QFile>
#include <QObject>
#include <QtQml/qqmlregistration.h>
#include <QProcess>
#include <QProcessEnvironment>

#include "domain/InstallStateStore.h"
#include <QString>

namespace Hypernucleus {

class PathManager;
class ModuleInstaller;

// Starts an installed game as a child process. Python games are run through
// the interpreter exactly like the original Hypernucleus did (game module on
// sys.path, dependencies and the per-game pip folder on PYTHONPATH, working
// directory = game folder, main() called). Native builds use the executable
// that matches the OS. Output is captured to logs/<game>.log.
class GameManager : public QObject {
    Q_OBJECT
    QML_ANONYMOUS
    Q_PROPERTY(bool running READ isRunning NOTIFY runningChanged)
    Q_PROPERTY(QString currentGame READ currentGame NOTIFY currentGameChanged)
    Q_PROPERTY(QString log READ log NOTIFY logChanged)

public:
    explicit GameManager(PathManager* pathManager, ModuleInstaller* installer,
                         QObject* parent = nullptr);
    ~GameManager() override;

    bool isRunning() const;
    QString currentGame() const;
    QString log() const { return m_log; }

    void setPlatform(const QString& os) { m_os = os; }
    void setPythonPath(const QString& path) { m_pythonPath = path; }
    QString logFilePath(const QString& gameName) const;

    // Uses the recorded install (path, kind, dependencies).
    Q_INVOKABLE void launchGame(const QString& name);
    Q_INVOKABLE void stopGame();

signals:
    void runningChanged();
    void currentGameChanged();
    void logChanged();
    void gameStarted(const QString& name);
    void gameStopped(const QString& name);
    void gameError(const QString& name, const QString& error);
    void gameOutput(const QString& text);
    void pythonMissing(const QString& name); // offer the managed Python

private:
    bool prepareNative(const InstallRecord& rec, QString& program);
    bool preparePython(const InstallRecord& rec, QString& program,
                       QStringList& args, QProcessEnvironment& env);
    void openLog(const InstallRecord& rec);
    void connectProcess(const QString& name);
    void append(const QString& text);
    void finishRun();

    PathManager* m_pathManager;
    ModuleInstaller* m_installer;
    QProcess* m_process = nullptr;
    QString m_currentGame;
    QString m_os;
    QString m_pythonPath;
    QString m_log;
    QFile m_logFile;
    QElapsedTimer m_runTime;
    bool m_running = false;
    bool m_errorReported = false;
    bool m_stopRequested = false;
};

} // namespace Hypernucleus
