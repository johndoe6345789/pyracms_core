#include <QtTest>
#include <QTemporaryDir>

#include "FakeRunner.h"
#include "services/PathManager.h"
#include "services/PipInstaller.h"

using namespace Hypernucleus;

// The per-game venv, driven through a scripted process runner.
class TstPipVenv : public QObject {
    Q_OBJECT

    struct Rig {
        QTemporaryDir d;
        PathManager paths{d.filePath("data")};
        PipInstaller pip{&paths};
        FakeRunner run;
        Rig()
        {
            touch(d.filePath("py")); // stands in for the interpreter
            pip.setPythonPath(d.filePath("py"));
            pip.setRunner(&run);
            run.effect = [this](const FakeRunner::Call& c) {
                if (c.args.value(1) == "venv") touch(paths.venvPython("g"));
            };
        }
    };

private slots:
    void createsTheVenvThenInstallsIntoIt();
    void reusesAnExistingVenv();
    void removesOldTargetFolderContent();
    void venvFailureIsReported();
    void venvWithoutInterpreterFails();
    void unstartablePythonFails();
    void missingPythonAsksForTheManagedOne();
    void nothingToInstallNeedsNoPython();
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

void TstPipVenv::removesOldTargetFolderContent()
{
    Rig r;
    touch(r.paths.pipTargetDir("g") + "/pygame/__init__.py");
    touch(r.paths.pipTargetDir("g") + "/six.py");
    QVERIFY(r.paths.hasLegacyTarget("g"));
    QSignalSpy done(&r.pip, &PipInstaller::finished);
    r.pip.install("g", r.d.path(), {"pygame"});
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QVERIFY(!QFileInfo::exists(r.paths.pipTargetDir("g") + "/six.py"));
    QVERIFY(!QFileInfo::exists(r.paths.pipTargetDir("g") + "/pygame"));
    QVERIFY(QFileInfo::exists(r.paths.venvPython("g")));
    QVERIFY(!r.paths.hasLegacyTarget("g"));
}

void TstPipVenv::venvFailureIsReported()
{
    Rig r;
    r.run.effect = nullptr;
    r.run.exitCode = 1;
    r.run.text = "No module named venv";
    QSignalSpy bad(&r.pip, &PipInstaller::failed);
    r.pip.install("g", r.d.path(), {"pygame"});
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(bad.at(0).at(1).toString().contains("environment"));
    QVERIFY(bad.at(0).at(1).toString().contains("No module named venv"));
    QCOMPARE(r.run.calls.size(), 1); // pip never ran
}

void TstPipVenv::venvWithoutInterpreterFails()
{
    Rig r;
    r.run.effect = nullptr; // exit 0 but nothing was created
    QSignalSpy bad(&r.pip, &PipInstaller::failed);
    r.pip.install("g", r.d.path(), {"pygame"});
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(bad.at(0).at(1).toString().contains("no interpreter"));
}

void TstPipVenv::unstartablePythonFails()
{
    Rig r;
    r.run.startFails = true;
    QSignalSpy bad(&r.pip, &PipInstaller::failed);
    r.pip.install("g", r.d.path(), {"pygame"});
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(bad.at(0).at(1).toString().contains("Could not start"));
}

void TstPipVenv::missingPythonAsksForTheManagedOne()
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

void TstPipVenv::nothingToInstallNeedsNoPython()
{
    Rig r;
    QSignalSpy done(&r.pip, &PipInstaller::finished);
    r.pip.install("g", r.d.path(), {"not a valid spec !!"});
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QVERIFY(r.run.calls.isEmpty());
}

QTEST_MAIN(TstPipVenv)
#include "qtst_PipVenv.moc"
