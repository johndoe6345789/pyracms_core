#include <QtTest>

#include "MiniHttp.h"
#include "PlannerFixture.h"
#include "ZipBuilder.h"
#include "services/InstallRunner.h"
#include "services/PipInstaller.h"

using namespace Hypernucleus;

class TstInstallRunner : public QObject {
    Q_OBJECT

    static PlanStep module(const char* n, const char* t, const char* url)
    {
        PlanStep s;
        s.name = n;
        s.type = t;
        s.version = "1";
        s.target.url = url;
        s.target.ok = true;
        return s;
    }

private slots:
    void failedStepStopsTheBatch();
    void cancelStopsTheBatch();
};

void TstInstallRunner::failedStepStopsTheBatch()
{
    MiniHttp http;
    PlannerFixture f;
    f.api.setBaseUrl(http.baseUrl());
    PipInstaller pip(&f.paths);
    InstallRunner run(&f.inst, &pip);
    InstallPlan plan;
    plan.rootName = "g";
    plan.steps = {module("lib", "dep", "/missing.zip"),
                  module("g", "game", "/g.zip")};
    QSignalSpy bad(&run, &InstallRunner::failed);
    run.run(plan);
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(bad.at(0).at(1).toString().contains("lib"));
    QVERIFY(!f.inst.isInstalled("g"));
    QVERIFY(http.paths.contains("/missing.zip"));
    QVERIFY(!http.paths.contains("/g.zip"));
}

void TstInstallRunner::cancelStopsTheBatch()
{
    MiniHttp http;
    PlannerFixture f;
    f.api.setBaseUrl(http.baseUrl());
    PipInstaller pip(&f.paths);
    InstallRunner run(&f.inst, &pip);
    InstallPlan plan;
    plan.rootName = "g";
    plan.steps = {module("g", "game", "/g.zip")};
    QSignalSpy gone(&run, &InstallRunner::cancelled);
    run.run(plan);
    run.cancel();
    QTRY_COMPARE_WITH_TIMEOUT(gone.count(), 1, 5000);
    QVERIFY(!run.isRunning());
    QSignalSpy busy(&run, &InstallRunner::failed);
    run.cancel(); // idle: harmless
    QCOMPARE(busy.count(), 0);
}

QTEST_MAIN(TstInstallRunner)
#include "qtst_InstallRunner_2.moc"
