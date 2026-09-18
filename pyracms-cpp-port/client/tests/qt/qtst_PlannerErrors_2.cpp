#include <QtTest>

#include "MiniHttp.h"
#include "PlannerFixture.h"

using namespace Hypernucleus;

class TstPlannerErrors : public QObject {
    Q_OBJECT

private slots:
    void pipFirstDecidesPerDependency();
    void abortStopsPlanning();
};

static QString failure(PlannerFixture& f, const QString& game,
                       const QString& version = QString())
{
    QSignalSpy bad(&f.planner, &InstallPlanner::planFailed);
    f.planner.plan(game, version);
    return bad.count() == 1 ? bad.at(0).at(1).toString() : QString();
}

void TstPlannerErrors::pipFirstDecidesPerDependency()
{
    MiniHttp http;
    http.routes["/pypi/pygame/json"] = "{}"; // on pip; privlib is not
    PlannerFixture f;
    f.pip.setIndexUrl(http.baseUrl() + "/pypi");
    f.planner.setPreferPip(true);
    f.seed({entry("g", "game", {rev("1", "f")},
                  {dep("pygame", "2.0"), dep("privlib")}),
            entry("privlib", "dep", {rev("1", "p")})});
    QSignalSpy ok(&f.planner, &InstallPlanner::planReady);
    f.planner.plan("g");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
    const auto plan = ok.at(0).at(0).value<InstallPlan>();
    QCOMPARE(plan.depNames, QStringList{"privlib"});
    QCOMPARE(plan.pipSpecs, QStringList{"pygame"}); // unpinned
}

void TstPlannerErrors::abortStopsPlanning()
{
    PlannerFixture f;
    f.seed({entry("g", "game", {rev("1", "f")}, {}, false)}); // detail
    QSignalSpy ok(&f.planner, &InstallPlanner::planReady);
    f.planner.plan("g");
    QVERIFY(f.planner.isPlanning());
    f.planner.abort();
    QVERIFY(!f.planner.isPlanning());
    QTest::qWait(50);
    QCOMPARE(ok.count(), 0);
}

QTEST_MAIN(TstPlannerErrors)
#include "qtst_PlannerErrors_2.moc"
