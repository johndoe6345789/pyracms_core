#pragma once

#include <QObject>
#include <QString>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

class ApiClient;
class DownloadCenter;
class GameManager;
class PathManager;
class PipInstaller;
class PythonProvisioner;
class SettingsManager;

// Ties the managed-Python download to the UI: when an install or a launch
// finds no interpreter it asks the user (promptVisible), shows the download
// in the DownloadCenter and afterwards repeats what was interrupted.
class PythonSetup : public QObject {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Owned by MainViewModel")
    Q_PROPERTY(bool promptVisible READ promptVisible NOTIFY changed)
    Q_PROPERTY(QString promptText READ promptText NOTIFY changed)
    Q_PROPERTY(bool busy READ busy NOTIFY changed)

public:
    PythonSetup(PathManager* paths, ApiClient* api, SettingsManager* settings,
                PipInstaller* pip, GameManager* games, DownloadCenter* dl,
                QObject* parent = nullptr);

    bool promptVisible() const { return m_prompt; }
    QString promptText() const { return m_text; }
    bool busy() const;
    PythonProvisioner* provisioner() const { return m_prov; }

    // What to repeat once Python is there.
    enum class Then { Install, Launch };
    void request(const QString& game, Then then);

    Q_INVOKABLE void accept();
    Q_INVOKABLE void decline();

signals:
    void changed();
    // Progress and failures the main window shows as toasts.
    void notice(const QString& text, bool error);

private:
    void wire();
    void onOffer(const QString& version, qint64 size);
    void onInstalled(const QString& exe);
    void onEnded(const QString& text, bool error);

    PythonProvisioner* m_prov;
    DownloadCenter* m_dl;
    GameManager* m_games;
    QString m_game;
    Then m_then = Then::Install;
    QString m_text;
    bool m_prompt = false;
};

} // namespace Hypernucleus
