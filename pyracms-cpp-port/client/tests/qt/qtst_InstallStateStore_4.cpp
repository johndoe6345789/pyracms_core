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
    void importsLegacyIni();
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

void TstInstallStateStore::importsLegacyIni()
{
    QTemporaryDir dir;
    QDir root(dir.path());
    QVERIFY(root.mkpath("games/oldgame"));
    QVERIFY(root.mkpath("dependencies/olddep"));
    const QString ini = dir.filePath("config.ini");
    {
        QSettings s(ini, QSettings::IniFormat);
        s.beginGroup("Installed Version");
        s.setValue("oldgame", "0.3");
        s.setValue("olddep", "1.1");
        s.endGroup();
        s.sync();
    }
    InstallStateStore store;
    const int n = store.importLegacyIni(ini, dir.filePath("games"),
                                        dir.filePath("dependencies"));
    QCOMPARE(n, 2);
    QCOMPARE(store.get("oldgame").type, QString("game"));
    QCOMPARE(store.get("oldgame").version, QString("0.3"));
    QCOMPARE(store.get("olddep").type, QString("dep"));
    QCOMPARE(store.get("olddep").path, dir.filePath("dependencies/olddep"));
}

QTEST_MAIN(TstInstallStateStore)
#include "qtst_InstallStateStore_4.moc"
