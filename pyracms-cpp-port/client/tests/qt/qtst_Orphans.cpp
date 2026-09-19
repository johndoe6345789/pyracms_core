#include <QtTest>
#include <QTemporaryDir>

#include "OrphanFixture.h"

using namespace Hypernucleus;

class TstOrphans : public QObject {
    Q_OBJECT

private slots:
    void sharedDependencyStaysUntilLastGame();
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

QTEST_MAIN(TstOrphans)
#include "qtst_Orphans.moc"
