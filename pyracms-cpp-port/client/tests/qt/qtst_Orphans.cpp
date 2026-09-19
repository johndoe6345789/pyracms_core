#include <QtTest>
#include <QTemporaryDir>

#include "MiniHttp.h"
#include "ZipBuilder.h"
#include "services/ApiClient.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

using namespace Hypernucleus;

class TstOrphans : public QObject {
    Q_OBJECT

    static QJsonObject target(const QString& file)
    {
        DownloadTarget t;
        t.url = file;
        t.moduleType = "folder";
        t.ok = true;
        return t.toJson();
    }

    void put(ModuleInstaller& inst, MiniHttp& http, const QString& zipPath,
             const QString& name, const char* type)
    {
        QVERIFY(buildZip(zipPath, {{name + "/a.py", "1"}}));
        http.routes["/" + name] = readAll(zipPath);
        QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
        inst.install(name, "1", target("/" + name), type);
        QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
    }

private slots:
    void sharedDependencyStaysUntilLastGame();
    void unsharedDependencyIsRemoved();
};

void TstOrphans::sharedDependencyStaysUntilLastGame()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    put(inst, http, dir.filePath("d.zip"), "libx", "dep");
    put(inst, http, dir.filePath("a.zip"), "ga", "game");
    put(inst, http, dir.filePath("b.zip"), "gb", "game");
    inst.annotate("ga", {"libx"}, {});
    inst.annotate("gb", {"libx"}, {});

    QSignalSpy orphan(&inst, &ModuleInstaller::orphanRemoved);
    inst.uninstall("ga", "1", "game");
    QCOMPARE(orphan.count(), 0);
    QVERIFY(inst.isInstalled("libx"));
    inst.uninstall("gb", "1", "game");
    QCOMPARE(orphan.count(), 1);
    QCOMPARE(orphan.at(0).at(0).toString(), QString("libx"));
    QVERIFY(!inst.isInstalled("libx"));
    QVERIFY(!QFileInfo::exists(paths.depDir("libx")));
}

void TstOrphans::unsharedDependencyIsRemoved()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    put(inst, http, dir.filePath("d.zip"), "one", "dep");
    put(inst, http, dir.filePath("e.zip"), "two", "dep");
    put(inst, http, dir.filePath("a.zip"), "ga", "game");
    put(inst, http, dir.filePath("b.zip"), "gb", "game");
    inst.annotate("ga", {"one", "two"}, {});
    inst.annotate("gb", {"two"}, {});
    inst.uninstall("ga", "1", "game");
    QVERIFY(!inst.isInstalled("one"));
    QVERIFY(inst.isInstalled("two"));
    QVERIFY(inst.isInstalled("gb"));
}

QTEST_MAIN(TstOrphans)
#include "qtst_Orphans.moc"
