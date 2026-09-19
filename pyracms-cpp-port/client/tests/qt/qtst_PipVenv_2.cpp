#include <QtTest>
#include <QTemporaryDir>

#include "PipRig.h"

using namespace Hypernucleus;

// The per-game venv, driven through a scripted process runner.

class TstPipVenv2 : public QObject {
    Q_OBJECT

private slots:
    void removesOldTargetFolderContent();
    void venvFailureIsReported();
};

void TstPipVenv2::removesOldTargetFolderContent()
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

void TstPipVenv2::venvFailureIsReported()
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

QTEST_MAIN(TstPipVenv2)
#include "qtst_PipVenv_2.moc"
