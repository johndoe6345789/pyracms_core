#include <QtTest>

#include "PlannerFixture.h"

using namespace Hypernucleus;

class TstInstallPlanner : public QObject {
    Q_OBJECT

private slots:
    void skipsInstalledDependency();
};

void TstInstallPlanner::skipsInstalledDependency()
{
    PlannerFixture f;
    f.seed({entry("g", "game", {rev("1", "f")}, {dep("lib", "1.0")}),
            entry("lib", "dep", {rev("1.0", "d")})});
    // Pretend lib 1 is installed already (state file on disk).
    InstallStateStore store(f.paths.stateFile());
    InstallRecord r;
    r.name = "lib";
    r.version = "1"; // "1" == "1.0"
    r.type = "dep";
    store.set(r);
    QVERIFY(store.save());
    ModuleInstaller inst2(&f.api, &f.paths);
    InstallPlanner planner(&f.repo, &inst2, &f.pip);
    planner.setPlatform("linux", "x86_64");
    planner.setPreferPip(false);
    QSignalSpy ok(&planner, &InstallPlanner::planReady);
    planner.plan("g");
    QCOMPARE(ok.count(), 1);
    const auto plan = ok.at(0).at(0).value<InstallPlan>();
    QCOMPARE(plan.depNames, QStringList{"lib"});   // still a runtime dep
    QCOMPARE(plan.steps.at(0).name, QString("g")); // but no download
}

QTEST_MAIN(TstInstallPlanner)
#include "qtst_InstallPlanner_2.moc"
