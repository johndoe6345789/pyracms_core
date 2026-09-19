#include <QtTest>
#include <QTemporaryDir>

#include "FakeExe.h"
#include "services/PathManager.h"
#include "services/PipInstaller.h"

using namespace Hypernucleus;

// A stand-in interpreter: prints its arguments, then behaves as told.
static QString fakePython(const QTemporaryDir& d, const QString& echo,
                          int exitCode = 0, int sleepSeconds = 0)
{
    FakeExe::configure(echo, exitCode, sleepSeconds);
    return FakeExe::install(d.filePath("fakepython.exe"));
}

class TstPipRun : public QObject {
    Q_OBJECT

private slots:
    void runsPipInAPerGameVenv();
    void nonZeroExitIsReportedWithLastLine();
};

void TstPipRun::runsPipInAPerGameVenv()
{
    QTemporaryDir d;
    PathManager paths(d.filePath("data"));
    PipInstaller pip(&paths);
    pip.setPythonPath(fakePython(d, ""));
    QCOMPARE(pip.pythonPath(), d.filePath("fakepython.exe"));
    QDir().mkpath(d.filePath("game"));
    QFile req(d.filePath("game/requirements.txt"));
    req.open(QIODevice::WriteOnly);
    req.close();

    QSignalSpy out(&pip, &PipInstaller::output);
    QSignalSpy done(&pip, &PipInstaller::finished);
    pip.install("g", d.filePath("game"), {"requests>=2", "numpy"});
    QVERIFY(pip.isBusy());
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QString text;
    for (const auto& o : out)
        text += o.at(1).toString();
    QVERIFY(text.contains("-m venv " + paths.venvDir("g")));
    QVERIFY(text.contains("-m pip install"));
    QVERIFY(!text.contains("--target"));
    QVERIFY(QFileInfo::exists(paths.venvPython("g")));
    QVERIFY(text.contains("-r " + d.filePath("game/requirements.txt")));
    QVERIFY(text.contains("requests>=2 numpy"));
    QVERIFY(QDir(paths.pipTargetDir("g")).exists());
}

void TstPipRun::nonZeroExitIsReportedWithLastLine()
{
    QTemporaryDir d;
    PathManager paths(d.filePath("data"));
    PipInstaller pip(&paths);
    pip.setPythonPath(fakePython(d, "No matching distribution", 1));
    QSignalSpy bad(&pip, &PipInstaller::failed);
    pip.install("g", d.path(), {"nosuchpackage"});
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    const QString msg = bad.at(0).at(1).toString();
    QVERIFY(msg.contains("exit 1"));
    QVERIFY(msg.contains("No matching distribution"));
    QVERIFY(!pip.isBusy());
}

QTEST_MAIN(TstPipRun)
#include "qtst_PipRun.moc"
