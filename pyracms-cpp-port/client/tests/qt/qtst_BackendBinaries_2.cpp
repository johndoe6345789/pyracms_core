#include <QtTest>

#include "BackendBinaries.h"
#include "PlannerFixture.h"
#include "domain/BinarySelector.h"
#include "domain/CatalogParser.h"

using namespace Hypernucleus;

// Per-OS / per-arch selection on the backend's binaries[] shape.

class TstBackendBinaries2 : public QObject {
    Q_OBJECT

private slots:
    void macArm64UsesRosettaWithoutNative();
    void linuxArm64HasNoBuildButSourceFallback();
    void planCarriesSizeShaAndDepKinds();
};

void TstBackendBinaries2::macArm64UsesRosettaWithoutNative()
{
    GameEntry g = bbGame();
    g.revisions.first().binaries.removeAt(2); // drop macOS arm64
    const auto t = BinarySelector::resolveTarget(g.revisions.first(), "game",
                                                 "macos", "arm64");
    QVERIFY(t.ok);
    QCOMPARE(t.size, qint64(5000));
    QVERIFY(!BinarySelector::emulatesX64("linux", "arm64"));
}

void TstBackendBinaries2::linuxArm64HasNoBuildButSourceFallback()
{
    const auto t = bbPick("linux", "arm64");
    QVERIFY(t.ok);
    QVERIFY(!t.nativeBuild); // the python source archive of the revision
    QCOMPARE(t.size, qint64(1234));
}

void TstBackendBinaries2::planCarriesSizeShaAndDepKinds()
{
    PlannerFixture f;
    f.planner.setPlatform("windows", "arm64");
    QList<GameEntry> all =
        CatalogParser::parseCatalog(fixtureJson("catalog_binaries.json"));
    all << entry("hn_helpers", "dep", {rev("1.2.0", "h1")});
    f.seed(all);
    QSignalSpy ok(&f.planner, &InstallPlanner::planReady);
    f.planner.plan("snake");
    QCOMPARE(ok.count(), 1);
    const auto plan = ok.at(0).at(0).value<InstallPlan>();
    QCOMPARE(plan.depNames, QStringList{"hn_helpers"});
    QCOMPARE(plan.pipSpecs, QStringList{"pygame==2.6.1"});
    const PlanStep& game = plan.steps.at(1);
    QCOMPARE(game.name, QString("snake"));
    QCOMPARE(game.target.size, qint64(4096));
    QCOMPARE(game.target.sha256.size(), 64);
    QCOMPARE(plan.steps.last().kind, PlanStep::Kind::Pip);
}

QTEST_MAIN(TstBackendBinaries2)
#include "qtst_BackendBinaries_2.moc"
