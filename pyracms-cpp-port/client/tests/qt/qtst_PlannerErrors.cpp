#include <QtTest>

#include "MiniHttp.h"
#include "PlannerFixture.h"

using namespace Hypernucleus;

class TstPlannerErrors : public QObject {
    Q_OBJECT

private slots:
    void unknownGameFails();
    void missingDependencyFails();
    void unpublishedVersionFails();
    void noBuildForThisPlatformFails();
    void toleratesCycles();
};

static QString failure(PlannerFixture& f, const QString& game,
                       const QString& version = QString())
{
    QSignalSpy bad(&f.planner, &InstallPlanner::planFailed);
    f.planner.plan(game, version);
    return bad.count() == 1 ? bad.at(0).at(1).toString() : QString();
}

void TstPlannerErrors::unknownGameFails()
{
    PlannerFixture f;
    QVERIFY(failure(f, "nope").contains("Unknown game"));
}

void TstPlannerErrors::missingDependencyFails()
{
    PlannerFixture f;
    f.seed({entry("g", "game", {rev("1", "f")}, {dep("ghost")})});
    QVERIFY(failure(f, "g").contains("neither on pip"));
}

void TstPlannerErrors::unpublishedVersionFails()
{
    PlannerFixture f;
    f.seed({entry("g", "game", {rev("1", "f"), rev("2", "x", false)})});
    QVERIFY(failure(f, "g", "2").contains("not available"));
    f.seed({entry("empty", "game", {})});
    QVERIFY(failure(f, "empty").contains("no published version"));
}

void TstPlannerErrors::noBuildForThisPlatformFails()
{
    PlannerFixture f;
    RevisionInfo r = rev("1", "");
    r.binaries = {BinaryInfo{"windows", "x86_64", "w", "", 0, "", ""}};
    f.seed({entry("g", "game", {r})});
    QVERIFY(failure(f, "g").contains("linux"));
}

void TstPlannerErrors::toleratesCycles()
{
    PlannerFixture f;
    f.seed({entry("g", "game", {rev("1", "f")}, {dep("a")}),
            entry("a", "dep", {rev("1", "a")}, {dep("b")}),
            entry("b", "dep", {rev("1", "b")}, {dep("a")})});
    QSignalSpy ok(&f.planner, &InstallPlanner::planReady);
    f.planner.plan("g");
    QCOMPARE(ok.count(), 1);
    QCOMPARE(ok.at(0).at(0).value<InstallPlan>().depNames.size(), 2);
}

QTEST_MAIN(TstPlannerErrors)
#include "qtst_PlannerErrors.moc"
