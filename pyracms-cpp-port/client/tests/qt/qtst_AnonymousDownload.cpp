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
    void publicDownloadWorksWithoutToken();
    void signedInDownloadSendsToken();
    void errorPageIsNeverStoredAsArchive();
};

void TstAnonymousAccess::publicDownloadWorksWithoutToken()
{
    MiniHttp http;
    http.routes["/api/files/abc"] = "archive-bytes";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    QSignalSpy done(&dm, &DownloadManager::finished);
    dm.start(dlJob(http, dir.filePath("a.zip")));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QVERIFY(!dlSentAuth(http));
}

void TstAnonymousAccess::signedInDownloadSendsToken()
{
    MiniHttp http;
    http.routes["/api/files/abc"] = "archive-bytes";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setToken("tok");
    DownloadManager dm(&api);
    QTemporaryDir dir;
    QSignalSpy done(&dm, &DownloadManager::finished);
    dm.start(dlJob(http, dir.filePath("a.zip")));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QVERIFY(dlSentAuth(http));
}

void TstAnonymousAccess::errorPageIsNeverStoredAsArchive()
{
    MiniHttp http;
    http.routes["/api/files/abc"] = R"({"error":"Forbidden"})";
    http.statuses["/api/files/abc"] = 403;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    const QString dest = dir.filePath("a.zip");
    QSignalSpy failed(&dm, &DownloadManager::failed);
    dm.start(dlJob(http, dest));
    QTRY_COMPARE_WITH_TIMEOUT(failed.count(), 1, 5000);
    QVERIFY(!QFileInfo::exists(dest));
    QCOMPARE(QFileInfo(dest + ".part").size(), qint64(0));
}

QTEST_MAIN(TstAnonymousAccess)
#include "qtst_AnonymousDownload.moc"
