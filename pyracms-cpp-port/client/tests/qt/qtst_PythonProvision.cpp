#include <QtTest>

#include "ProvisionFixture.h"
#include "services/PythonLocator.h"

using namespace Hypernucleus;

class TstPythonProvision : public QObject {
    Q_OBJECT

private slots:
    void offersThenDownloadsVerifiesAndUnpacks();
    void declineDownloadsNothing();
    void locatorFindsTheManagedInterpreter();
};

void TstPythonProvision::offersThenDownloadsVerifiesAndUnpacks()
{
    Provision p;
    QSignalSpy offer(&p.prov, &PythonProvisioner::offerReady);
    QSignalSpy done(&p.prov, &PythonProvisioner::installed);
    p.prov.resolve();
    QVERIFY(p.prov.isBusy());
    QTRY_COMPARE_WITH_TIMEOUT(offer.count(), 1, 5000);
    QCOMPARE(offer.at(0).at(0).toString(), QString("3.12.14"));
    QCOMPARE(offer.at(0).at(1).toLongLong(), qint64(p.body.size()));
    QVERIFY(p.http.paths.isEmpty()); // nothing downloaded before consent
    p.prov.accept();
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 8000);
    QVERIFY(!p.prov.isBusy());
    QVERIFY(p.tar.args.contains("-xzf"));
    QCOMPARE(p.tar.args.last(), QString("python-staging"));
    QVERIFY(!QDir::isAbsolutePath(p.tar.args.at(1))); // no "C:" for tar
    QCOMPARE(p.tar.workDir, p.paths.dataDir());
    QVERIFY(QFileInfo::exists(done.at(0).at(0).toString()));
    QVERIFY(!QFileInfo::exists(p.paths.dataDir() + "/python-staging"));
}

void TstPythonProvision::declineDownloadsNothing()
{
    Provision p;
    QSignalSpy offer(&p.prov, &PythonProvisioner::offerReady);
    p.prov.resolve();
    QTRY_COMPARE_WITH_TIMEOUT(offer.count(), 1, 5000);
    p.prov.decline();
    QVERIFY(!p.prov.isBusy());
    p.prov.accept(); // nothing offered any more: ignored
    QVERIFY(p.http.paths.isEmpty());
    QVERIFY(p.tar.args.isEmpty());
}

void TstPythonProvision::locatorFindsTheManagedInterpreter()
{
    Provision p;
    QSignalSpy done(&p.prov, &PythonProvisioner::installed);
    p.prov.resolve();
    QTRY_VERIFY_WITH_TIMEOUT(p.prov.state() ==
                                 PythonProvisioner::State::Offered, 5000);
    p.prov.accept();
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 8000);
    const PythonInfo py = PythonLocator::find(QString(), p.paths.dataDir());
    QVERIFY(py.exe.startsWith(p.paths.dataDir() + "/python"));
}

QTEST_MAIN(TstPythonProvision)
#include "qtst_PythonProvision.moc"
