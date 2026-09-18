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
    void runsPythonGameThroughBootstrap();
};

void TstLaunchFlow::runsPythonGameThroughBootstrap()
{
    if (QStandardPaths::findExecutable("python3").isEmpty())
        QSKIP("python3 is not installed");
    QVERIFY(
        buildZip(m_dir.filePath("p.zip"),
                 {{"pygame1/__init__.py",
                   "import os\ndef main():\n"
                   "    print('py-ok', os.path.basename(os.getcwd()))\n"}}));
    m_http.routes["/p.zip"] = readAll(m_dir.filePath("p.zip"));
    install("pygame1", "/p.zip", false);

    QSignalSpy stopped(m_games, &GameManager::gameStopped);
    QSignalSpy err(m_games, &GameManager::gameError);
    m_games->launchGame("pygame1");
    QTRY_VERIFY_WITH_TIMEOUT(stopped.count() + err.count() == 1, 8000);
    QVERIFY2(m_games->log().contains("py-ok pygame1"),
             qPrintable(m_games->log()));
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
#include "qtst_LaunchFlow_5.moc"
