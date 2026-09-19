#include <QtTest>
#include <QTemporaryDir>

#include "FakeExe.h"
#include "FakeRunner.h"
#include "GameInstall.h"
#include "services/GameManager.h"

using namespace Hypernucleus;

// A game with pip packages starts with the interpreter of its venv.
class TstLaunchVenv : public QObject {
    Q_OBJECT

private slots:
    void runsWithTheVenvInterpreter();
};

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

QTEST_MAIN(TstLaunchVenv)
#include "qtst_LaunchVenv.moc"
