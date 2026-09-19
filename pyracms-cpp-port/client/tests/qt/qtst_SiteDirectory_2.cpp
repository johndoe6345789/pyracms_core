#include <QtTest>

#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/SiteDirectory.h"

using namespace Hypernucleus;

class TstSiteDirectory : public QObject {
    Q_OBJECT

private slots:
    void invalidAddressIsReportedWithoutRequest();
    void emptyServerSaysSo();
    void newerLoadSupersedesOlder();
};

void TstSiteDirectory::invalidAddressIsReportedWithoutRequest()
{
    ApiClient api;
    SiteDirectory dir(&api);
    dir.load("localhost");
    QVERIFY(!dir.loading());
    QVERIFY(dir.status().contains("valid server address"));
}

void TstSiteDirectory::emptyServerSaysSo()
{
    MiniHttp http;
    http.routes["/api/tenants"] = "[]";
    ApiClient api;
    SiteDirectory dir(&api);
    dir.load(http.baseUrl());
    QTRY_VERIFY_WITH_TIMEOUT(!dir.loading(), 5000);
    QVERIFY(dir.status().contains("no sites"));
}

void TstSiteDirectory::newerLoadSupersedesOlder()
{
    MiniHttp first, second;
    first.routes["/api/tenants"] = R"([{"slug":"old"}])";
    second.routes["/api/tenants"] = R"([{"slug":"new"}])";
    ApiClient api;
    SiteDirectory dir(&api);
    dir.load(first.baseUrl());
    dir.load(second.baseUrl());
    QTRY_VERIFY_WITH_TIMEOUT(!dir.loading(), 5000);
    QTest::qWait(200);
    QCOMPARE(dir.sites().size(), 1);
    QCOMPARE(dir.sites()[0].toMap()["value"].toString(), QString("new"));
}

QTEST_MAIN(TstSiteDirectory)
#include "qtst_SiteDirectory_2.moc"
