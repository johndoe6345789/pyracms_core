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
    void installsFlattensTopLevelFolder();
    void installsPlainZipContent();
};

void TstInstallFlow::installsFlattensTopLevelFolder()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    const QString z = dir.filePath("g.zip");
    QVERIFY(buildZip(
        z, {{"tetris/main.py", "print(1)"}, {"tetris/data/a.txt", "a"}}));
    http.routes["/g.zip"] = readAll(z);

    QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
    QSignalSpy state(&inst, &ModuleInstaller::installStateChanged);
    inst.install("tetris", "1.0", target("/g.zip"), "game");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
    QVERIFY(QFileInfo::exists(paths.gameDir("tetris") + "/main.py"));
    QVERIFY(QFileInfo::exists(paths.gameDir("tetris") + "/data/a.txt"));
    QCOMPARE(inst.installedVersion("tetris"), QString("1.0"));
    const InstallRecord r = inst.record("tetris");
    QCOMPARE(r.kind, QString("python"));
    QCOMPARE(r.path, paths.gameDir("tetris"));
    QVERIFY(r.sizeBytes > 0);
    QVERIFY(state.count() >= 1);
    QVERIFY(!inst.isBusy());
    QVERIFY(!QFileInfo::exists(paths.archivePath("game-tetris-1.0.zip")));
}

void TstInstallFlow::installsPlainZipContent()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    const QString z = dir.filePath("d.zip");
    QVERIFY(buildZip(z, {{"a.py", "x"}, {"b.py", "y"}}));
    http.routes["/d.zip"] = readAll(z);
    QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
    inst.install("lib", "2", target("/d.zip"), "dep");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
    QVERIFY(QFileInfo::exists(paths.depDir("lib") + "/a.py"));
    QCOMPARE(inst.record("lib").type, QString("dep"));
}

QTEST_MAIN(TstInstallFlow)
#include "qtst_InstallFlow.moc"
