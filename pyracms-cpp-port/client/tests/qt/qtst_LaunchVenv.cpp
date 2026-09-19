#include <QtTest>
#include <QTemporaryDir>

#include "FakeExe.h"
#include "FakeRunner.h"
#include "MiniHttp.h"
#include "ZipBuilder.h"
#include "services/ApiClient.h"
#include "services/GameManager.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

using namespace Hypernucleus;

// A game with pip packages starts with the interpreter of its venv.
class TstLaunchVenv : public QObject {
    Q_OBJECT

private slots:
    void runsWithTheVenvInterpreter();
    void withoutAnyPythonAsksForTheManagedOne();
};

static void installGame(ModuleInstaller& inst, MiniHttp& http,
                        const QString& zip)
{
    QVERIFY(buildZip(zip, {{"g/__init__.py", "def main(): pass"}}));
    http.routes["/g.zip"] = readAll(zip);
    DownloadTarget t;
    t.url = "/g.zip";
    t.ok = true;
    t.moduleType = "folder";
    QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
    inst.install("g", "1.0", t.toJson(), "game");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
}

void TstLaunchVenv::runsWithTheVenvInterpreter()
{
    MiniHttp http;
    QTemporaryDir d;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(d.filePath("data"));
    ModuleInstaller inst(&api, &paths);
    installGame(inst, http, d.filePath("g.zip"));
    FakeExe::configure("from-venv");
    QDir().mkpath(QFileInfo(paths.venvPython("g")).absolutePath());
    FakeExe::install(paths.venvPython("g"));
    // An old --target folder next to the venv must not reach PYTHONPATH.
    touch(paths.pipTargetDir("g") + "/six.py");

    GameManager games(&paths, &inst);
    games.setPythonPath(d.filePath("no-such-python")); // venv needs none
    QSignalSpy stopped(&games, &GameManager::gameStopped);
    games.launchGame("g");
    QTRY_COMPARE_WITH_TIMEOUT(stopped.count(), 1, 8000);
    QVERIFY(games.log().contains("from-venv"));
    QVERIFY(games.log().contains("-u -c"));
}

void TstLaunchVenv::withoutAnyPythonAsksForTheManagedOne()
{
    MiniHttp http;
    QTemporaryDir d;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(d.filePath("data"));
    ModuleInstaller inst(&api, &paths);
    installGame(inst, http, d.filePath("g.zip"));
    GameManager games(&paths, &inst);
    const QByteArray oldPath = qgetenv("PATH");
    qputenv("PATH", d.path().toUtf8());
    QSignalSpy need(&games, &GameManager::pythonMissing);
    QSignalSpy err(&games, &GameManager::gameError);
    games.launchGame("g");
    qputenv("PATH", oldPath);
    QCOMPARE(need.count(), 1);
    QCOMPARE(err.count(), 1);
}

QTEST_MAIN(TstLaunchVenv)
#include "qtst_LaunchVenv.moc"
