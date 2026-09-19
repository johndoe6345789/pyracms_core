#include <QtTest>

#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"

using namespace Hypernucleus;

class TstEntryRepositoryTenant : public QObject {
    Q_OBJECT

private slots:
    void loadsTheCatalogOfTheChosenSiteAnonymously();
    void usesOutputsJsonWhenCatalogRouteIsMissing();
};

static const char* kCat =
    R"({"gamedep":[{"game":{"name":"g1","displayName":"G1"}}]})";

void TstEntryRepositoryTenant::loadsTheCatalogOfTheChosenSiteAnonymously()
{
    MiniHttp http;
    http.routes["/api/tenants/acme"] = R"({"id":7,"slug":"acme"})";
    http.routes["/api/gamedep/catalog?tenant_id=7"] = kCat;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("acme");
    EntryRepository repo(&api);
    QSignalSpy done(&repo, &EntryRepository::refreshed);
    repo.refresh();
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QCOMPARE(repo.entries("game").size(), 1);
    QCOMPARE(http.paths, (QList<QString>{"/api/tenants/acme",
                                         "/api/gamedep/catalog?tenant_id=7"}));
    for (const QString& head : http.heads)
        QVERIFY(!head.contains("Authorization", Qt::CaseInsensitive));
}

void TstEntryRepositoryTenant::usesOutputsJsonWhenCatalogRouteIsMissing()
{
    MiniHttp http;
    http.routes["/api/tenants/acme"] = R"({"id":7})";
    http.routes["/api/outputs/json?tenant_id=7"] = kCat;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("acme");
    EntryRepository repo(&api);
    QSignalSpy done(&repo, &EntryRepository::refreshed);
    repo.refresh();
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QVERIFY(repo.find("g1", "game"));
}

QTEST_MAIN(TstEntryRepositoryTenant)
#include "qtst_EntryRepository_4.moc"
