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
    void legacyImportSkipsMissingFolders();
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

void TstInstallStateStore::legacyImportSkipsMissingFolders()
{
    QTemporaryDir dir;
    const QString ini = dir.filePath("config.ini");
    {
        QSettings s(ini, QSettings::IniFormat);
        s.beginGroup("Installed Version");
        s.setValue("ghost", "1.0");
        s.endGroup();
        s.sync();
    }
    InstallStateStore store;
    QCOMPARE(store.importLegacyIni(ini, dir.filePath("games"),
                                   dir.filePath("dependencies")),
             0);
    QCOMPARE(store.count(), 0);
}

QTEST_MAIN(TstInstallStateStore)
#include "qtst_InstallStateStore_5.moc"
