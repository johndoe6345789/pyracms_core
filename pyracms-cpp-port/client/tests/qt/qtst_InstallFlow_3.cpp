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
    void reinstallReplacesOldFiles();
    void uninstallRemovesFilesAndState();
};

void TstInstallFlow::reinstallReplacesOldFiles()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    QVERIFY(buildZip(dir.filePath("1.zip"), {{"old.py", "1"}}));
    QVERIFY(buildZip(dir.filePath("2.zip"), {{"new.py", "2"}}));
    http.routes["/1.zip"] = readAll(dir.filePath("1.zip"));
    http.routes["/2.zip"] = readAll(dir.filePath("2.zip"));
    QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
    inst.install("g", "1.0", target("/1.zip"), "game");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
    inst.install("g", "2.0", target("/2.zip"), "game");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 2, 5000);
    QVERIFY(!QFileInfo::exists(paths.gameDir("g") + "/old.py"));
    QVERIFY(QFileInfo::exists(paths.gameDir("g") + "/new.py"));
    QCOMPARE(inst.installedVersion("g"), QString("2.0"));
}

void TstInstallFlow::uninstallRemovesFilesAndState()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    QVERIFY(buildZip(dir.filePath("g.zip"), {{"a.py", "1"}}));
    http.routes["/g.zip"] = readAll(dir.filePath("g.zip"));
    QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
    inst.install("g", "1", target("/g.zip"), "game");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
    QDir().mkpath(paths.pipTargetDir("g"));
    QSignalSpy gone(&inst, &ModuleInstaller::uninstallComplete);
    inst.uninstall("g", "1", "game");
    QCOMPARE(gone.count(), 1);
    QVERIFY(!inst.isInstalled("g"));
    QVERIFY(!QFileInfo::exists(paths.gameDir("g")));
    QVERIFY(!QFileInfo::exists(paths.pipTargetDir("g")));
}

QTEST_MAIN(TstInstallFlow)
#include "qtst_InstallFlow_3.moc"
