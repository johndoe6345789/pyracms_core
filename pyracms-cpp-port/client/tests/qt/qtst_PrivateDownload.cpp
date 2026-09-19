#include <QtTest>
#include <QTemporaryDir>

#include "DownloadJob.h"
#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/DownloadManager.h"
#include "services/RequestAuth.h"

using namespace Hypernucleus;

class TstAnonymousAccess : public QObject {
    Q_OBJECT

private slots:
    void privateGameAsksToSignIn();
    void signedInUserWithoutAccessIsToldSo();
};

void TstAnonymousAccess::privateGameAsksToSignIn()
{
    MiniHttp http;
    http.routes["/api/files/abc"] = R"({"error":"Forbidden"})";
    for (int status : {401, 403}) {
        http.statuses["/api/files/abc"] = status;
        ApiClient api;
        api.setBaseUrl(http.baseUrl());
        DownloadManager dm(&api);
        QTemporaryDir dir;
        QSignalSpy failed(&dm, &DownloadManager::failed);
        dm.start(dlJob(http, dir.filePath("a.zip")));
        QTRY_COMPARE_WITH_TIMEOUT(failed.count(), 1, 5000);
        QCOMPARE(failed.at(0).at(1).toString(),
                 QString("This game is private - sign in to install."));
    }
}

void TstAnonymousAccess::signedInUserWithoutAccessIsToldSo()
{
    MiniHttp http;
    http.routes["/api/files/abc"] = "{}";
    http.statuses["/api/files/abc"] = 403;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setToken("tok");
    DownloadManager dm(&api);
    QTemporaryDir dir;
    QSignalSpy failed(&dm, &DownloadManager::failed);
    dm.start(dlJob(http, dir.filePath("a.zip")));
    QTRY_COMPARE_WITH_TIMEOUT(failed.count(), 1, 5000);
    QVERIFY(failed.at(0).at(1).toString().contains("do not have access"));
}

QTEST_MAIN(TstAnonymousAccess)
#include "qtst_PrivateDownload.moc"
