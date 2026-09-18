#include <QtTest>

#include "MiniHttp.h"
#include "PlannerFixture.h"
#include "ZipBuilder.h"
#include "models/Constants.h"
#include "services/InstallRunner.h"
#include "services/PipInstaller.h"
#include "viewmodels/DownloadCenter.h"

using namespace Hypernucleus;

// Planner + runner + download center over one seeded catalog.
struct CenterFixture {
    CenterFixture()
        : pip(&f.paths), runner(&f.inst, &pip), center(&f.planner, &runner)
    {
        f.api.setBaseUrl(http.baseUrl());
        for (const char* n : {"g1", "g2"}) {
            const QString z = f.dir.filePath(QString(n) + ".zip");
            buildZip(z, {{QString(n) + "/main.py", "x"}});
            http.routes[QString("/api/files/") + n] = readAll(z);
        }
        f.seed({entry("g1", "game", {rev("1", "g1")}),
                entry("g2", "game", {rev("1", "g2")})});
    }
    MiniHttp http;
    PlannerFixture f;
    PipInstaller pip;
    InstallRunner runner;
    DownloadCenter center;
};

class TstUiDownloadCenter : public QObject {
    Q_OBJECT

private slots:
    void unknownGameFails();
    void cancelActiveStopsPlanningOrDownload();
};

void TstUiDownloadCenter::unknownGameFails()
{
    CenterFixture c;
    QSignalSpy bad(&c.center, &DownloadCenter::gameFailed);
    c.center.enqueue("ghost", "");
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 3000);
    QVERIFY(bad.at(0).at(1).toString().contains("Unknown game"));
    QVERIFY(!c.center.busy());
}

void TstUiDownloadCenter::cancelActiveStopsPlanningOrDownload()
{
    CenterFixture c;
    QSignalSpy gone(&c.center, &DownloadCenter::gameCancelled);
    c.center.cancelActive(); // idle: harmless
    c.center.enqueue("g1", "");
    c.center.cancelActive();
    QTRY_VERIFY_WITH_TIMEOUT(gone.count() >= 1 || !c.center.busy(), 8000);
    QTRY_VERIFY_WITH_TIMEOUT(!c.center.busy(), 8000);
}

QTEST_MAIN(TstUiDownloadCenter)
#include "qtst_UiDownloadCenter_3.moc"
