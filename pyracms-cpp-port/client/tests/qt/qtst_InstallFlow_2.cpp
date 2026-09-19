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
    void installsSingleFileAsExecutable();
    void checksumMismatchInstallsNothing();
};

void TstInstallFlow::installsSingleFileAsExecutable()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    http.routes["/bin"] = "#!/bin/sh\necho hi\n";
    QJsonObject t = target("/bin", true);
    t["executable"] = "run.exe";
    QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
    inst.install("nat", "1", t, "game");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
    const QFileInfo fi(paths.gameDir("nat") + "/run.exe");
    QVERIFY(fi.exists());
    QVERIFY(fi.isExecutable());
    QCOMPARE(inst.record("nat").kind, QString("native"));
    QCOMPARE(inst.record("nat").executable, QString("run.exe"));
}

void TstInstallFlow::checksumMismatchInstallsNothing()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    http.routes["/g.zip"] = "not what the manifest promised";
    QJsonObject t = target("/g.zip");
    t["sha256"] = QString(64, '0');
    QSignalSpy bad(&inst, &ModuleInstaller::installFailed);
    inst.install("evil", "1", t, "game");
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(bad.at(0).at(1).toString().contains("Checksum"));
    QVERIFY(!inst.isInstalled("evil"));
    QVERIFY(!QFileInfo::exists(paths.gameDir("evil")));
    QVERIFY(!inst.isBusy());
}

QTEST_MAIN(TstInstallFlow)
#include "qtst_InstallFlow_2.moc"
