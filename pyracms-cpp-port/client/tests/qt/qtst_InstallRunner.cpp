#include <QtTest>

#include "MiniHttp.h"
#include "PlannerFixture.h"
#include "ZipBuilder.h"
#include "services/InstallRunner.h"
#include "services/PipInstaller.h"

using namespace Hypernucleus;

class TstInstallRunner : public QObject {
    Q_OBJECT

    static PlanStep module(const char* n, const char* t, const char* url)
    {
        PlanStep s;
        s.name = n;
        s.type = t;
        s.version = "1";
        s.target.url = url;
        s.target.ok = true;
        return s;
    }

private slots:
    void installsDependenciesThenGameAndAnnotates();
};

void TstInstallRunner::installsDependenciesThenGameAndAnnotates()
{
    MiniHttp http;
    PlannerFixture f;
    f.api.setBaseUrl(http.baseUrl());
    QVERIFY(buildZip(f.dir.filePath("l.zip"), {{"lib/a.py", "1"}}));
    QVERIFY(buildZip(f.dir.filePath("g.zip"), {{"g/main.py", "2"}}));
    http.routes["/l.zip"] = readAll(f.dir.filePath("l.zip"));
    http.routes["/g.zip"] = readAll(f.dir.filePath("g.zip"));

    PipInstaller pip(&f.paths);
    InstallRunner run(&f.inst, &pip);
    InstallPlan plan;
    plan.rootName = "g";
    plan.depNames = {"lib"};
    plan.pipSpecs = {"requests"};
    PlanStep pipStep;
    pipStep.kind = PlanStep::Kind::Pip;
    pipStep.name = "g";
    plan.steps = {module("lib", "dep", "/l.zip"), module("g", "game", "/g.zip"),
                  pipStep};

    QSignalSpy steps(&run, &InstallRunner::stepChanged);
    QSignalSpy prog(&run, &InstallRunner::progress);
    QSignalSpy done(&run, &InstallRunner::finished);
    run.run(plan);
    QVERIFY(run.isRunning());
    QCOMPARE(run.rootName(), QString("g"));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 8000);
    QCOMPARE(steps.count(), 3);
    QCOMPARE(steps.at(2).at(3).toString(), QString("pip packages for g"));
    QVERIFY(prog.count() > 0);
    QVERIFY(f.inst.isInstalled("lib"));
    QCOMPARE(f.inst.record("g").deps, QStringList{"lib"});
    QVERIFY(!run.isRunning());
}

QTEST_MAIN(TstInstallRunner)
#include "qtst_InstallRunner.moc"
