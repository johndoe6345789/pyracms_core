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
    void removeAndContains();
    void versionsMap();
    void setFillsInstalledAt();
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

void TstInstallStateStore::removeAndContains()
{
    InstallStateStore store;
    store.set(makeRecord("a", "1"));
    store.set(makeRecord("b", "2"));
    QVERIFY(store.contains("a"));
    QVERIFY(store.remove("a"));
    QVERIFY(!store.remove("a"));
    QVERIFY(!store.contains("a"));
    QCOMPARE(store.names(), QStringList{"b"});
}

void TstInstallStateStore::versionsMap()
{
    InstallStateStore store;
    store.set(makeRecord("a", "1.0"));
    store.set(makeRecord("b", "2.5"));
    const QMap<QString, QString> v = store.versions();
    QCOMPARE(v.size(), 2);
    QCOMPARE(v.value("a"), QString("1.0"));
    QCOMPARE(store.version("b"), QString("2.5"));
}

void TstInstallStateStore::setFillsInstalledAt()
{
    InstallStateStore store;
    InstallRecord r = makeRecord("a", "1");
    r.installedAt.clear();
    store.set(r);
    QVERIFY(!store.get("a").installedAt.isEmpty());
    QVERIFY(QDateTime::fromString(store.get("a").installedAt, Qt::ISODate)
                .isValid());
}

QTEST_MAIN(TstInstallStateStore)
#include "qtst_InstallStateStore_2.moc"
