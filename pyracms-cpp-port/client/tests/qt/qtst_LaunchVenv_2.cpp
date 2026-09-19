#include <QtTest>
#include <QTemporaryDir>

#include "FakeExe.h"
#include "FakeRunner.h"
#include "GameInstall.h"
#include "services/GameManager.h"

using namespace Hypernucleus;

// A game with pip packages starts with the interpreter of its venv.

class TstLaunchVenv2 : public QObject {
    Q_OBJECT

private slots:
    void withoutAnyPythonAsksForTheManagedOne();
};

void TstLaunchVenv2::withoutAnyPythonAsksForTheManagedOne()
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

QTEST_MAIN(TstLaunchVenv2)
#include "qtst_LaunchVenv_2.moc"
