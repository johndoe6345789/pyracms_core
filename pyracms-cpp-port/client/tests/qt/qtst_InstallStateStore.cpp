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
    void emptyWhenFileMissing();
    void roundTripsAllFields();
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

void TstInstallStateStore::emptyWhenFileMissing()
{
    QTemporaryDir dir;
    InstallStateStore store(dir.filePath("installed.json"));
    QVERIFY(store.load());
    QCOMPARE(store.count(), 0);
    QVERIFY(!store.contains("x"));
    QVERIFY(store.get("x").version.isEmpty());
}

void TstInstallStateStore::roundTripsAllFields()
{
    QTemporaryDir dir;
    const QString file = dir.filePath("installed.json");
    {
        InstallStateStore store(file);
        store.set(makeRecord("tetris", "1.2"));
        QVERIFY(store.save());
    }
    InstallStateStore loaded(file);
    QVERIFY(loaded.load());
    QCOMPARE(loaded.count(), 1);
    const InstallRecord r = loaded.get("tetris");
    QCOMPARE(r.version, QString("1.2"));
    QCOMPARE(r.type, QString("game"));
    QCOMPARE(r.path, QString("/data/games/tetris"));
    QCOMPARE(r.moduleType, QString("folder"));
    QCOMPARE(r.kind, QString("python"));
    QCOMPARE(r.executable, QString("run.py"));
    QCOMPARE(r.deps, (QStringList{"pygame", "numpy"}));
    QCOMPARE(r.pipSpecs, (QStringList{"requests>=2"}));
    QCOMPARE(r.installedAt, QString("2026-01-02T03:04:05Z"));
    QCOMPARE(r.sizeBytes, qint64(12345));
}

QTEST_MAIN(TstInstallStateStore)
#include "qtst_InstallStateStore.moc"
