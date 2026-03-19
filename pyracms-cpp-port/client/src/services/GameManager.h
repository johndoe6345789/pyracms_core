#pragma once

#include <QObject>
#include <QProcess>
#include <QString>
#include <QJsonObject>
#include <QJsonArray>

namespace Hypernucleus {

class PathManager;
class ModuleInstaller;

class GameManager : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool running READ isRunning NOTIFY runningChanged)
    Q_PROPERTY(QString currentGame READ currentGame NOTIFY currentGameChanged)

public:
    explicit GameManager(PathManager* pathManager, ModuleInstaller* installer,
                         QObject* parent = nullptr);
    ~GameManager() override;

    bool isRunning() const;
    QString currentGame() const;

    Q_INVOKABLE void launchGame(const QString& name, const QString& version,
                                 const QJsonObject& revisionData);
    Q_INVOKABLE void stopGame();

signals:
    void runningChanged();
    void currentGameChanged();
    void gameStarted(const QString& name);
    void gameStopped(const QString& name);
    void gameError(const QString& name, const QString& error);
    void gameOutput(const QString& text);

private:
    void buildPythonPath(const QJsonArray& dependencies, QStringList& paths);
    QString findExecutable(const QString& gameDir, const QString& name);

    PathManager* m_pathManager;
    ModuleInstaller* m_installer;
    QProcess* m_process = nullptr;
    QString m_currentGame;
    bool m_running = false;
};

} // namespace Hypernucleus
