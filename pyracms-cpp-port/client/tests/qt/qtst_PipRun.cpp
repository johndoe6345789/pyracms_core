#include <QtTest>
#include <QTemporaryDir>

#include "services/PathManager.h"
#include "services/PipInstaller.h"

using namespace Hypernucleus;

// A stand-in interpreter: prints its arguments, then behaves as told.
static QString fakePython(const QTemporaryDir& d, const QString& body)
{
    const QString path = d.filePath("fakepython");
    QFile f(path);
    f.open(QIODevice::WriteOnly);
    f.write("#!/bin/sh\necho \"ARGS: $@\"\n" + body.toUtf8() + "\n");
    f.close();
    f.setPermissions(f.permissions() | QFile::ExeOwner);
    return path;
}

class TstPipRun : public QObject {
    Q_OBJECT

private slots:
    void runsPipWithTargetAndRequirements();
    void nonZeroExitIsReportedWithLastLine();
};

void TstPipRun::runsPipWithTargetAndRequirements()
{
    QTemporaryDir d;
    PathManager paths(d.filePath("data"));
    PipInstaller pip(&paths);
    pip.setPythonPath(fakePython(d, "exit 0"));
    QCOMPARE(pip.pythonPath(), d.filePath("fakepython"));
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
    QVERIFY(text.contains("-m pip install"));
    QVERIFY(text.contains("--target " + paths.pipTargetDir("g")));
    QVERIFY(text.contains("-r " + d.filePath("game/requirements.txt")));
    QVERIFY(text.contains("requests>=2 numpy"));
    QVERIFY(QDir(paths.pipTargetDir("g")).exists());
}

void TstPipRun::nonZeroExitIsReportedWithLastLine()
{
    QTemporaryDir d;
    PathManager paths(d.filePath("data"));
    PipInstaller pip(&paths);
    pip.setPythonPath(fakePython(d, "echo 'No matching distribution'; exit 1"));
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
