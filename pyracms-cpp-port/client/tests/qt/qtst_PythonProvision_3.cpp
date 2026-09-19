#include <QtTest>

#include "ProvisionFixture.h"

using namespace Hypernucleus;

class TstPythonProvision3 : public QObject {
    Q_OBJECT

private slots:
    void tarFailureLeavesNoPython();
    void cancelWhileOffered();
};

void TstPythonProvision3::tarFailureLeavesNoPython()
{
    Provision p;
    p.tar.exitCode = 2;
    QSignalSpy bad(&p.prov, &PythonProvisioner::failed);
    QSignalSpy offer(&p.prov, &PythonProvisioner::offerReady);
    p.prov.resolve();
    QTRY_COMPARE_WITH_TIMEOUT(offer.count(), 1, 5000);
    p.prov.accept();
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 8000);
    QVERIFY(bad.at(0).at(0).toString().contains("bad archive"));
    QVERIFY(!QFileInfo::exists(p.paths.dataDir() + "/python"));
    QVERIFY(!QFileInfo::exists(p.paths.dataDir() + "/python-staging"));
}

void TstPythonProvision3::cancelWhileOffered()
{
    Provision p;
    QSignalSpy gone(&p.prov, &PythonProvisioner::cancelled);
    p.prov.resolve();
    p.prov.cancel(); // while still looking the release up
    QCOMPARE(gone.count(), 1);
    QTest::qWait(50); // the late reply is ignored
    QVERIFY(!p.prov.isBusy());
}

QTEST_MAIN(TstPythonProvision3)
#include "qtst_PythonProvision_3.moc"
