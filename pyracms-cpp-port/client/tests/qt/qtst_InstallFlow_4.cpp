#include <QtTest>
#include <QTemporaryDir>

#include "MiniHttp.h"
#include "ZipBuilder.h"
#include "services/ApiClient.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

using namespace Hypernucleus;

class TstInstallFlow : public QObject {
    Q_OBJECT

    static QJsonObject target(const QString& file, bool native = false)
    {
        DownloadTarget t;
        t.url = file;
        t.moduleType = "folder";
        t.nativeBuild = native;
        t.ok = true;
        return t.toJson();
    }

private slots:
    void stateSurvivesRestart();
    void missingFileReferenceFails();
};

void TstInstallFlow::stateSurvivesRestart()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    {
        ModuleInstaller inst(&api, &paths);
        QVERIFY(buildZip(dir.filePath("g.zip"), {{"a.py", "1"}}));
        http.routes["/g.zip"] = readAll(dir.filePath("g.zip"));
        QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
        inst.install("g", "3.1", target("/g.zip"), "game");
        QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
        inst.annotate("g", {"dep1"}, {"numpy"});
    }
    ModuleInstaller again(&api, &paths);
    QCOMPARE(again.installedVersion("g"), QString("3.1"));
    QCOMPARE(again.record("g").deps, QStringList{"dep1"});
    QCOMPARE(again.record("g").pipSpecs, QStringList{"numpy"});
    QCOMPARE(again.installedRecords().size(), 1);
    QCOMPARE(again.installPath("g"), paths.gameDir("g"));
}

void TstInstallFlow::missingFileReferenceFails()
{
    QTemporaryDir dir;
    ApiClient api;
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    QSignalSpy bad(&inst, &ModuleInstaller::installFailed);
    inst.install("x", "1", QJsonObject(), "game");
    QCOMPARE(bad.count(), 1);
    QVERIFY(bad.at(0).at(1).toString().contains("No file UUID"));
    QSignalSpy nope(&inst, &ModuleInstaller::uninstallFailed);
    inst.uninstall("x", "1", "game");
    QCOMPARE(nope.count(), 1);
}

QTEST_MAIN(TstInstallFlow)
#include "qtst_InstallFlow_4.moc"
