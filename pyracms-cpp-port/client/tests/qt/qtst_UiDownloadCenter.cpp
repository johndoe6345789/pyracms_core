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
    void installsAndReportsStates();
};

void TstUiDownloadCenter::installsAndReportsStates()
{
    CenterFixture c;
    QSignalSpy states(&c.center, &DownloadCenter::gameStateChanged);
    QSignalSpy done(&c.center, &DownloadCenter::gameFinished);
    c.center.enqueue("g1", "");
    QVERIFY(c.center.busy());
    QCOMPARE(c.center.activeName(), QString("g1"));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 8000);
    QCOMPARE(done.at(0).at(1).toString(), QString("1"));
    QVERIFY(!c.center.busy());
    QVERIFY(c.f.inst.isInstalled("g1"));
    QSet<int> seen;
    for (const auto& s : states)
        seen << s.at(1).toInt();
    QVERIFY(seen.contains(GameStates::Downloading));
    QVERIFY(seen.contains(GameStates::Installing));
}

QTEST_MAIN(TstUiDownloadCenter)
#include "qtst_UiDownloadCenter.moc"
