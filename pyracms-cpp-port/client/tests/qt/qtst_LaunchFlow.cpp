#include <QtTest>
#include <QTemporaryDir>

#include "FakeExe.h"
#include "MiniHttp.h"
#include "ZipBuilder.h"
#include "services/ApiClient.h"
#include "services/GameManager.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

using namespace Hypernucleus;

// Installs a tiny game through the real installer, then launches it.
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
    void runsNativeGameAndCapturesLog();
};

void TstLaunchFlow::runsNativeGameAndCapturesLog()
{
    FakeExe::configure("hello-native");
    QVERIFY(buildZip(m_dir.filePath("n.zip"),
                     {{"nat/nat.exe", FakeExe::bytes()}}));
    m_http.routes["/n.zip"] = readAll(m_dir.filePath("n.zip"));
    install("nat", "/n.zip", true, "nat.exe");

    QSignalSpy started(m_games, &GameManager::gameStarted);
    QSignalSpy stopped(m_games, &GameManager::gameStopped);
    m_games->launchGame("nat");
    QTRY_COMPARE_WITH_TIMEOUT(stopped.count(), 1, 5000);
    QCOMPARE(started.count(), 1);
    QVERIFY(m_games->log().contains("hello-native"));
    QVERIFY(readAll(m_games->logFilePath("nat")).contains("hello-native"));
    QVERIFY(!m_games->isRunning());
}

void TstLaunchFlow::init()
{
    m_api.setBaseUrl(m_http.baseUrl());
    m_paths = new PathManager(m_dir.filePath("data"));
    m_inst = new ModuleInstaller(&m_api, m_paths);
    m_games = new GameManager(m_paths, m_inst);
    m_games->setPlatform(FakeExe::hostOs());
}

void TstLaunchFlow::cleanup()
{
    delete m_games;
    delete m_inst;
    delete m_paths;
    QDir(m_dir.filePath("data")).removeRecursively();
}

QTEST_MAIN(TstLaunchFlow)
#include "qtst_LaunchFlow.moc"
