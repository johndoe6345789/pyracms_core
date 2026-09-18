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
    void secondJobIsQueuedThenRuns();
    void removingQueuedJobCancelsIt();
};

void TstUiDownloadCenter::secondJobIsQueuedThenRuns()
{
    CenterFixture c;
    QSignalSpy states(&c.center, &DownloadCenter::gameStateChanged);
    QSignalSpy done(&c.center, &DownloadCenter::gameFinished);
    c.center.enqueue("g1", "");
    c.center.enqueue("g2", "");
    c.center.enqueue("g2", ""); // duplicates are ignored
    QCOMPARE(c.center.queue(), QStringList{"g2"});
    QVERIFY(c.center.isQueued("g2"));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 2, 12000);
    QVERIFY(c.center.queue().isEmpty());
    QVERIFY(c.f.inst.isInstalled("g2"));
    bool sawQueued = false;
    for (const auto& s : states)
        sawQueued |= s.at(0) == "g2" && s.at(1) == GameStates::Queued;
    QVERIFY(sawQueued);
}

void TstUiDownloadCenter::removingQueuedJobCancelsIt()
{
    CenterFixture c;
    QSignalSpy gone(&c.center, &DownloadCenter::gameCancelled);
    c.center.enqueue("g1", "");
    c.center.enqueue("g2", "");
    c.center.removeQueued("g2");
    QCOMPARE(gone.count(), 1);
    QVERIFY(c.center.queue().isEmpty());
    c.center.removeQueued("nope"); // harmless
    c.center.cancelActive();
    QTRY_VERIFY_WITH_TIMEOUT(!c.center.busy(), 8000);
}

QTEST_MAIN(TstUiDownloadCenter)
#include "qtst_UiDownloadCenter_2.moc"
