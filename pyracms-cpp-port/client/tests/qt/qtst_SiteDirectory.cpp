#include <QtTest>

#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/SiteDirectory.h"

using namespace Hypernucleus;

class TstSiteDirectory : public QObject {
    Q_OBJECT

private slots:
    void listsSitesAsNameAndSlug();
    void requestIsAnonymousEvenWhenSignedIn();
    void unreachableServerGivesGracefulMessage();
};

void TstSiteDirectory::listsSitesAsNameAndSlug()
{
    MiniHttp http;
    http.routes["/api/tenants"] =
        R"([{"id":1,"slug":"acme","displayName":"Acme Games"},
            {"id":2,"slug":"zed"}])";
    ApiClient api;
    SiteDirectory dir(&api);
    QSignalSpy spy(&dir, &SiteDirectory::changed);
    dir.load(http.baseUrl() + "/");
    QVERIFY(dir.loading());
    QTRY_VERIFY_WITH_TIMEOUT(!dir.loading(), 5000);
    QVERIFY(dir.status().isEmpty());
    const QVariantList sites = dir.sites();
    QCOMPARE(sites.size(), 2);
    QCOMPARE(sites[0].toMap()["label"].toString(),
             QString("Acme Games (acme)"));
    QCOMPARE(sites[1].toMap()["value"].toString(), QString("zed"));
    QVERIFY(spy.count() >= 2);
}

void TstSiteDirectory::requestIsAnonymousEvenWhenSignedIn()
{
    MiniHttp http;
    http.routes["/api/tenants"] = "[]";
    ApiClient api;
    api.setToken("secret-token");
    SiteDirectory dir(&api);
    dir.load(http.baseUrl());
    QTRY_VERIFY_WITH_TIMEOUT(!dir.loading(), 5000);
    QCOMPARE(http.paths.size(), 1);
    QVERIFY(!http.heads.last().contains("Authorization", Qt::CaseInsensitive));
    QVERIFY(!http.heads.last().contains("secret-token"));
}

void TstSiteDirectory::unreachableServerGivesGracefulMessage()
{
    ApiClient api;
    SiteDirectory dir(&api);
    dir.load("http://127.0.0.1:1"); // nothing listens on port 1
    QTRY_VERIFY_WITH_TIMEOUT(!dir.loading(), 5000);
    QVERIFY(dir.sites().isEmpty());
    QVERIFY(dir.status().contains("Could not reach the server"));
    QVERIFY(dir.status().contains("type a site"));
}

QTEST_MAIN(TstSiteDirectory)
#include "qtst_SiteDirectory.moc"
