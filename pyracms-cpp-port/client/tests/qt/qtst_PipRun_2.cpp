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
    void cancelKillsTheProcess();
    void secondCallWhileBusyFails();
};

void TstPipRun::cancelKillsTheProcess()
{
    QTemporaryDir d;
    PathManager paths(d.filePath("data"));
    PipInstaller pip(&paths);
    pip.setPythonPath(fakePython(d, "", 0, 30));
    QSignalSpy started(&pip, &PipInstaller::started);
    QSignalSpy gone(&pip, &PipInstaller::cancelled);
    pip.install("g", d.path(), {"slow"});
    QCOMPARE(started.count(), 1);
    pip.cancel();
    QTRY_COMPARE_WITH_TIMEOUT(gone.count(), 1, 8000);
    QVERIFY(!pip.isBusy());
    pip.cancel(); // idle: harmless
}

void TstPipRun::secondCallWhileBusyFails()
{
    QTemporaryDir d;
    PathManager paths(d.filePath("data"));
    PipInstaller pip(&paths);
    pip.setPythonPath(fakePython(d, "", 0, 30));
    pip.install("g", d.path(), {"slow"});
    QSignalSpy bad(&pip, &PipInstaller::failed);
    pip.install("h", d.path(), {"slow"});
    QCOMPARE(bad.count(), 1);
    pip.cancel();
    QTRY_VERIFY_WITH_TIMEOUT(!pip.isBusy(), 8000);
}

QTEST_MAIN(TstPipRun)
#include "qtst_PipRun_2.moc"
