#include <QtTest>
#include <QTemporaryDir>

#include "OrphanFixture.h"

using namespace Hypernucleus;

class TstOrphans2 : public QObject {
    Q_OBJECT

private slots:
    void unsharedDependencyIsRemoved();
};

void TstOrphans2::unsharedDependencyIsRemoved()
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

QTEST_MAIN(TstOrphans2)
#include "qtst_Orphans_2.moc"
