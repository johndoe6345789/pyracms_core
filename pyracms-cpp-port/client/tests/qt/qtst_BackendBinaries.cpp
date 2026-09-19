#include <QtTest>

#include "BackendBinaries.h"
#include "PlannerFixture.h"
#include "domain/BinarySelector.h"
#include "domain/CatalogParser.h"

using namespace Hypernucleus;

// Per-OS / per-arch selection on the backend's binaries[] shape.
class TstBackendBinaries : public QObject {
    Q_OBJECT

private slots:
    void windowsX64();
    void windowsArm64FallsBackToX64();
    void macArm64PrefersNativeBuild();
};

void TstBackendBinaries::windowsX64()
{
    QCOMPARE(bbPick("windows", "x86_64").executable, QString("snake.exe"));
}

void TstBackendBinaries::windowsArm64FallsBackToX64()
{
    const auto t = bbPick("windows", "arm64");
    QVERIFY(t.ok);
    QVERIFY(t.nativeBuild);
    QCOMPARE(t.size, qint64(4096));
    QVERIFY(BinarySelector::emulatesX64("win", "aarch64"));
}

void TstBackendBinaries::macArm64PrefersNativeBuild()
{
    const auto t = bbPick("macos", "arm64");
    QCOMPARE(t.size, qint64(4800));
    QCOMPARE(t.sha256, QString("%1").arg(3 * 7919, 64, 16, QChar('0')));
}

QTEST_MAIN(TstBackendBinaries)
#include "qtst_BackendBinaries.moc"
