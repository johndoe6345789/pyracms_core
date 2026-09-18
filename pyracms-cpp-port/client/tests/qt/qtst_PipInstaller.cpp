#include <QtTest>
#include <QTemporaryDir>

#include "services/PathManager.h"
#include "services/PipInstaller.h"
#include "services/PythonLocator.h"

using namespace Hypernucleus;

class TstPipInstaller : public QObject {
    Q_OBJECT

private slots:
    void nothingToInstallFinishesImmediately();
    void missingPythonIsReported();
    void configuredPythonWins();
};

void TstPipInstaller::nothingToInstallFinishesImmediately()
{
    QTemporaryDir d;
    PathManager paths(d.path());
    PipInstaller pip(&paths);
    QSignalSpy done(&pip, &PipInstaller::finished);
    pip.install("g", d.path(), {"--evil", "http://x"}); // all rejected
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 3000);
    QVERIFY(!pip.isBusy());
}

void TstPipInstaller::missingPythonIsReported()
{
    QTemporaryDir d;
    PathManager paths(d.path());
    PipInstaller pip(&paths);
    pip.setPythonPath("/definitely/not/python");
    const QByteArray oldPath = qgetenv("PATH");
    qputenv("PATH", "");
    QSignalSpy bad(&pip, &PipInstaller::failed);
    pip.install("g", d.path(), {"requests"});
    qputenv("PATH", oldPath);
    QCOMPARE(bad.count(), 1);
    QVERIFY(bad.at(0).at(1).toString().contains("Python was not found"));
}

void TstPipInstaller::configuredPythonWins()
{
    QTemporaryDir d;
    QFile f(d.filePath("mypython"));
    QVERIFY(f.open(QIODevice::WriteOnly));
    f.close();
    QCOMPARE(PythonLocator::find(d.filePath("mypython"), d.path()).exe,
             QFileInfo(f).absoluteFilePath());
    QVERIFY(PythonLocator::managedCandidates().size() >= 2);

    QDir().mkpath(d.filePath("python/bin"));
    QFile m(d.filePath("python/bin/python3"));
    QVERIFY(m.open(QIODevice::WriteOnly));
    m.close();
    QCOMPARE(PythonLocator::find("", d.path()).exe,
             QFileInfo(m).absoluteFilePath());
}

QTEST_MAIN(TstPipInstaller)
#include "qtst_PipInstaller.moc"
