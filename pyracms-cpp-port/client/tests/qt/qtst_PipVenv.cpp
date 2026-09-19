#include <QtTest>
#include <QTemporaryDir>

#include "PipRig.h"

using namespace Hypernucleus;

// The per-game venv, driven through a scripted process runner.
class TstPipVenv : public QObject {
    Q_OBJECT

private slots:
    void createsTheVenvThenInstallsIntoIt();
    void reusesAnExistingVenv();
};

void TstPipVenv::createsTheVenvThenInstallsIntoIt()
{
    Rig r;
    QSignalSpy done(&r.pip, &PipInstaller::finished);
    r.pip.install("g", r.d.path(), {"pygame==2.6.1"});
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QCOMPARE(r.run.calls.size(), 2);
    QCOMPARE(r.run.calls[0].program, r.d.filePath("py"));
    QCOMPARE(r.run.calls[0].args,
             (QStringList{"-m", "venv", r.paths.venvDir("g")}));
    QCOMPARE(r.run.calls[1].program, r.paths.venvPython("g"));
    QVERIFY(r.run.calls[1].args.contains("pygame==2.6.1"));
    QVERIFY(!r.run.calls[1].args.contains("--target"));
    QVERIFY(!r.pip.isBusy());
}

void TstPipVenv::reusesAnExistingVenv()
{
    Rig r;
    touch(r.paths.venvPython("g"));
    QSignalSpy done(&r.pip, &PipInstaller::finished);
    r.pip.install("g", r.d.path(), {"pyglet"});
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QCOMPARE(r.run.calls.size(), 1);
    QCOMPARE(r.run.calls[0].program, r.paths.venvPython("g"));
}

QTEST_MAIN(TstPipVenv)
#include "qtst_PipVenv.moc"
