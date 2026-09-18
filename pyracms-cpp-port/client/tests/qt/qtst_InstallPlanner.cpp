#include <QtTest>

#include "PlannerFixture.h"

using namespace Hypernucleus;

class TstInstallPlanner : public QObject {
    Q_OBJECT

private slots:
    void ordersDepsBeforeGameThenPip();
    void explicitPipSourceBecomesSpec();
};

void TstInstallPlanner::ordersDepsBeforeGameThenPip()
{
    PlannerFixture f;
    f.seed({entry("tetris", "game", {rev("1.0", "f1"), rev("1.2", "f2")},
                  {dep("pygame", "2.0"), dep("privlib")}),
            entry("pygame", "dep", {rev("2.0", "d1")}, {dep("privlib")}),
            entry("privlib", "dep", {rev("0.3", "d2")})});
    QSignalSpy ok(&f.planner, &InstallPlanner::planReady);
    f.planner.plan("tetris");
    QCOMPARE(ok.count(), 1);
    const auto plan = ok.at(0).at(0).value<InstallPlan>();
    QCOMPARE(plan.rootVersion, QString("1.2")); // latest
    QStringList order;
    for (const PlanStep& s : plan.steps)
        order << s.name + ":" +
                     (s.kind == PlanStep::Kind::Pip ? "pip" : s.type);
    QCOMPARE(order, (QStringList{"privlib:dep", "pygame:dep", "tetris:game",
                                 "tetris:pip"}));
    QCOMPARE(plan.depNames, (QStringList{"privlib", "pygame"}));
    QCOMPARE(plan.steps.at(2).target.fileRef, QString("f2"));
}

void TstInstallPlanner::explicitPipSourceBecomesSpec()
{
    PlannerFixture f;
    GameEntry g =
        entry("g", "game", {rev("1", "f")},
              {dep("requests", "2.31", "pip"), dep("numpy", "", "pip")});
    g.pipRequirements = {"pillow>=9"};
    f.seed({g});
    QSignalSpy ok(&f.planner, &InstallPlanner::planReady);
    f.planner.plan("g");
    QCOMPARE(ok.count(), 1);
    const auto plan = ok.at(0).at(0).value<InstallPlan>();
    QCOMPARE(plan.steps.size(), 2); // game + pip, no dep modules
    QCOMPARE(plan.pipSpecs,
             (QStringList{"pillow>=9", "requests==2.31", "numpy"}));
    QCOMPARE(plan.steps.at(1).pipSpecs, plan.pipSpecs);
}

QTEST_MAIN(TstInstallPlanner)
#include "qtst_InstallPlanner.moc"
