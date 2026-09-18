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
    void secondInstallWhileBusyFails();
};

void TstInstallFlow::secondInstallWhileBusyFails()
{
    MiniHttp http;
    QTemporaryDir dir;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    PathManager paths(dir.path());
    ModuleInstaller inst(&api, &paths);
    QSignalSpy bad(&inst, &ModuleInstaller::installFailed);
    QSignalSpy cancelled(&inst, &ModuleInstaller::installCancelled);
    inst.install("a", "1", target("/a.zip"), "game");
    QVERIFY(inst.isBusy());
    inst.install("b", "1", target("/b.zip"), "game");
    QCOMPARE(bad.count(), 1);
    QCOMPARE(bad.at(0).at(0).toString(), QString("b"));
    inst.cancel();
    QTRY_COMPARE_WITH_TIMEOUT(cancelled.count(), 1, 5000);
    QVERIFY(!inst.isBusy());
}

QTEST_MAIN(TstInstallFlow)
#include "qtst_InstallFlow_5.moc"
