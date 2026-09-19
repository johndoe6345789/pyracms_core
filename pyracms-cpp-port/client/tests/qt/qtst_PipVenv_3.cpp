#include <QtTest>
#include <QTemporaryDir>

#include "PipRig.h"

using namespace Hypernucleus;

// The per-game venv, driven through a scripted process runner.

class TstPipVenv3 : public QObject {
    Q_OBJECT

private slots:
    void venvWithoutInterpreterFails();
    void unstartablePythonFails();
    void missingPythonAsksForTheManagedOne();
    void nothingToInstallNeedsNoPython();
};

void TstPipVenv3::venvWithoutInterpreterFails()
{
    Rig r;
    r.run.effect = nullptr; // exit 0 but nothing was created
    QSignalSpy bad(&r.pip, &PipInstaller::failed);
    r.pip.install("g", r.d.path(), {"pygame"});
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(bad.at(0).at(1).toString().contains("no interpreter"));
}

void TstPipVenv3::unstartablePythonFails()
{
    Rig r;
    r.run.startFails = true;
    QSignalSpy bad(&r.pip, &PipInstaller::failed);
    r.pip.install("g", r.d.path(), {"pygame"});
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(bad.at(0).at(1).toString().contains("Could not start"));
}

void TstPipVenv3::missingPythonAsksForTheManagedOne()
{
    QTemporaryDir d;
    PathManager paths(d.filePath("data"));
    PipInstaller pip(&paths);
    const QByteArray oldPath = qgetenv("PATH");
    qputenv("PATH", d.path().toUtf8()); // no interpreter anywhere
    QSignalSpy need(&pip, &PipInstaller::pythonMissing);
    QSignalSpy bad(&pip, &PipInstaller::failed);
    pip.install("g", d.path(), {"pygame"});
    qputenv("PATH", oldPath);
    QCOMPARE(need.count(), 1);
    QCOMPARE(need.at(0).at(0).toString(), QString("g"));
    QCOMPARE(bad.count(), 1);
}

void TstPipVenv3::nothingToInstallNeedsNoPython()
{
    Rig r;
    QSignalSpy done(&r.pip, &PipInstaller::finished);
    r.pip.install("g", r.d.path(), {"not a valid spec !!"});
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QVERIFY(r.run.calls.isEmpty());
}

QTEST_MAIN(TstPipVenv3)
#include "qtst_PipVenv_3.moc"
