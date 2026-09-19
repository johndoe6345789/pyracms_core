#include <QtTest>

#include "Fixture.h"
#include "PlannerFixture.h"
#include "domain/BinarySelector.h"
#include "domain/CatalogParser.h"

using namespace Hypernucleus;

// Per-OS / per-arch selection on the backend's binaries[] shape.
class TstBackendBinaries : public QObject {
    Q_OBJECT

    GameEntry game() const
    {
        return CatalogParser::parseCatalog(
                   fixtureJson("catalog_binaries.json"))
            .first();
    }
    DownloadTarget pick(const QString& os, const QString& arch) const
    {
        const GameEntry g = game();
        return BinarySelector::resolveTarget(g.revisions.first(), "game", os,
                                             arch);
    }

private slots:
    void windowsX64();
    void windowsArm64FallsBackToX64();
    void macArm64PrefersNativeBuild();
    void macArm64UsesRosettaWithoutNative();
    void linuxArm64HasNoBuildButSourceFallback();
    void planCarriesSizeShaAndDepKinds();
};

void TstBackendBinaries::windowsX64()
{
    QCOMPARE(pick("windows", "x86_64").executable, QString("snake.exe"));
}

void TstBackendBinaries::windowsArm64FallsBackToX64()
{
    const auto t = pick("windows", "arm64");
    QVERIFY(t.ok);
    QVERIFY(t.nativeBuild);
    QCOMPARE(t.size, qint64(4096));
    QVERIFY(BinarySelector::emulatesX64("win", "aarch64"));
}

void TstBackendBinaries::macArm64PrefersNativeBuild()
{
    const auto t = pick("macos", "arm64");
    QCOMPARE(t.size, qint64(4800));
    QCOMPARE(t.sha256, QString("%1").arg(3 * 7919, 64, 16, QChar('0')));
}

void TstBackendBinaries::macArm64UsesRosettaWithoutNative()
{
    GameEntry g = game();
    g.revisions.first().binaries.removeAt(2); // drop macOS arm64
    const auto t = BinarySelector::resolveTarget(g.revisions.first(), "game",
                                                 "macos", "arm64");
    QVERIFY(t.ok);
    QCOMPARE(t.size, qint64(5000));
    QVERIFY(!BinarySelector::emulatesX64("linux", "arm64"));
}

void TstBackendBinaries::linuxArm64HasNoBuildButSourceFallback()
{
    const auto t = pick("linux", "arm64");
    QVERIFY(t.ok);
    QVERIFY(!t.nativeBuild); // the python source archive of the revision
    QCOMPARE(t.size, qint64(1234));
}

void TstBackendBinaries::planCarriesSizeShaAndDepKinds()
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

QTEST_MAIN(TstBackendBinaries)
#include "qtst_BackendBinaries.moc"
