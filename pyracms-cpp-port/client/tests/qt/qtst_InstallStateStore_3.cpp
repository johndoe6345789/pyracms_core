#include <QtTest>
#include <QDir>
#include <QFile>
#include <QSettings>
#include <QTemporaryDir>

#include "domain/InstallStateStore.h"

using namespace Hypernucleus;

class TstInstallStateStore : public QObject {
    Q_OBJECT

private slots:
    void corruptFileIsMovedAside();
    void saveCreatesParentFolders();
};

static InstallRecord makeRecord(const QString& name, const QString& version)
{
    InstallRecord r;
    r.name = name;
    r.version = version;
    r.type = "game";
    r.path = "/data/games/" + name;
    r.moduleType = "folder";
    r.kind = "python";
    r.executable = "run.py";
    r.deps = {"pygame", "numpy"};
    r.pipSpecs = {"requests>=2"};
    r.installedAt = "2026-01-02T03:04:05Z";
    r.sizeBytes = 12345;
    return r;
}

void TstInstallStateStore::corruptFileIsMovedAside()
{
    QTemporaryDir dir;
    const QString file = dir.filePath("installed.json");
    QFile f(file);
    QVERIFY(f.open(QIODevice::WriteOnly));
    f.write("{ this is not json");
    f.close();

    InstallStateStore store(file);
    QVERIFY(!store.load());     // reported ...
    QCOMPARE(store.count(), 0); // ... but usable
    QVERIFY(QFileInfo::exists(file + ".corrupt"));
    QVERIFY(!QFileInfo::exists(file));

    store.set(makeRecord("a", "1"));
    QVERIFY(store.save());
    InstallStateStore again(file);
    QVERIFY(again.load());
    QCOMPARE(again.count(), 1);
}

void TstInstallStateStore::saveCreatesParentFolders()
{
    QTemporaryDir dir;
    InstallStateStore store(dir.filePath("deep/er/installed.json"));
    store.set(makeRecord("a", "1"));
    QVERIFY(store.save());
    QVERIFY(QFileInfo::exists(dir.filePath("deep/er/installed.json")));
}

QTEST_MAIN(TstInstallStateStore)
#include "qtst_InstallStateStore_3.moc"
