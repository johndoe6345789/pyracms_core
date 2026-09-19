#include <QtTest>

#include "ProvisionFixture.h"

using namespace Hypernucleus;

class TstPythonProvision2 : public QObject {
    Q_OBJECT

private slots:
    void refusesAWrongChecksum();
    void refusesAReleaseWithoutChecksums();
    void reportsUnsupportedPlatforms();
    void reportsLookupFailures();
};

void TstPythonProvision2::refusesAWrongChecksum()
{
    Provision p(false); // SHA256SUMS lists a different hash
    QSignalSpy bad(&p.prov, &PythonProvisioner::failed);
    QSignalSpy offer(&p.prov, &PythonProvisioner::offerReady);
    p.prov.resolve();
    QTRY_COMPARE_WITH_TIMEOUT(offer.count(), 1, 5000);
    p.prov.accept();
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 8000);
    QVERIFY(p.tar.args.isEmpty()); // never unpacked
    QVERIFY(!QFileInfo::exists(p.paths.dataDir() + "/python"));
    QVERIFY(!p.prov.isBusy());
}

void TstPythonProvision2::refusesAReleaseWithoutChecksums()
{
    Provision p(true, false);
    QSignalSpy bad(&p.prov, &PythonProvisioner::failed);
    p.prov.resolve();
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(bad.at(0).at(0).toString().contains("checksum"));
}

void TstPythonProvision2::reportsUnsupportedPlatforms()
{
    Provision p;
    p.prov.setPlatform("linux", "riscv64");
    QSignalSpy bad(&p.prov, &PythonProvisioner::failed);
    p.prov.resolve();
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
}

void TstPythonProvision2::reportsLookupFailures()
{
    Provision p;
    p.fetch.bodies.clear(); // GitHub unreachable
    QSignalSpy bad(&p.prov, &PythonProvisioner::failed);
    p.prov.resolve();
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(!p.prov.isBusy());
}

QTEST_MAIN(TstPythonProvision2)
#include "qtst_PythonProvision_2.moc"
