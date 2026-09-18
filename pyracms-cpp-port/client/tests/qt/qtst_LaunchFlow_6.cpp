#include <QtTest>
#include <QTemporaryDir>

#include "MiniHttp.h"
#include "ZipBuilder.h"
#include "services/ApiClient.h"
#include "services/GameManager.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"
using namespace Hypernucleus;

class TstLaunchFlow : public QObject {
    Q_OBJECT

    MiniHttp m_http;
    QTemporaryDir m_dir;
    ApiClient m_api;
    PathManager* m_paths = nullptr;
    ModuleInstaller* m_inst = nullptr;
    GameManager* m_games = nullptr;

    void install(const QString& name, const QString& file, bool native,
                 const QString& exe = QString())
    {
        DownloadTarget t;
        t.url = file;
        t.ok = true;
        t.nativeBuild = native;
        t.executable = exe;
        t.moduleType = "folder";
        QSignalSpy ok(m_inst, &ModuleInstaller::installComplete);
        m_inst->install(name, "1.0", t.toJson(), "game");
        QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
    }

private slots:
    void init();
    void cleanup();
    void stopEndsTheProcess();
};

void TstLaunchFlow::stopEndsTheProcess()
{
    QVERIFY(buildZip(m_dir.filePath("s.zip"),
                     {{"slow.sh", "#!/bin/sh\nsleep 30\n"}}));
    m_http.routes["/s.zip"] = readAll(m_dir.filePath("s.zip"));
    install("slow", "/s.zip", true, "slow.sh");
    QSignalSpy started(m_games, &GameManager::gameStarted);
    QSignalSpy stopped(m_games, &GameManager::gameStopped);
    m_games->launchGame("slow");
    QTRY_COMPARE_WITH_TIMEOUT(started.count(), 1, 5000);
    QVERIFY(m_games->isRunning());
    QCOMPARE(m_games->currentGame(), QString("slow"));
    QSignalSpy busy(m_games, &GameManager::gameError);
    m_games->launchGame("slow"); // second launch while running
    QCOMPARE(busy.count(), 1);
    m_games->stopGame();
    QTRY_COMPARE_WITH_TIMEOUT(stopped.count(), 1, 8000);
    QVERIFY(!m_games->isRunning());
}

void TstLaunchFlow::init()
{
    m_api.setBaseUrl(m_http.baseUrl());
    m_paths = new PathManager(m_dir.filePath("data"));
    m_inst = new ModuleInstaller(&m_api, m_paths);
    m_games = new GameManager(m_paths, m_inst);
    m_games->setPlatform("linux");
}

void TstLaunchFlow::cleanup()
{
    delete m_games;
    delete m_inst;
    delete m_paths;
    QDir(m_dir.filePath("data")).removeRecursively();
}

QTEST_MAIN(TstLaunchFlow)
#include "qtst_LaunchFlow_6.moc"
