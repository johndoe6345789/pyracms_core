#include <QtTest>

#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"

using namespace Hypernucleus;

class TstEntryRepository : public QObject {
    Q_OBJECT

private slots:
    void fallsBackToListEndpoints();
    void refreshFailureIsReported();
    void ensureDetailMergesAndNotifies();
};

static const char* kCatalog = R"({
 "games":[{"name":"g1","displayName":"G1","revisions":
           [{"version":"1","fileId":5,"published":true}]}],
 "deps":[{"name":"d1","displayName":"D1","revisions":[]}]})";

void TstEntryRepository::fallsBackToListEndpoints()
{
    MiniHttp http;
    http.routes["/api/tenants/acme"] = R"({"id":7})";
    http.routes["/api/gamedep/game?limit=200"] =
        R"([{"name":"old","displayName":"Old"}])";
    http.routes["/api/gamedep/dep?limit=200"] = R"([{"name":"dd"}])";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("acme");
    EntryRepository repo(&api);
    QSignalSpy done(&repo, &EntryRepository::refreshed);
    repo.refresh();
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QCOMPARE(repo.entries("game").size(), 1);
    QCOMPARE(repo.entries("dep").size(), 1);
}

void TstEntryRepository::refreshFailureIsReported()
{
    MiniHttp http; // tenant lookup fails
    http.statuses["/api/tenants/acme"] = 500;
    http.routes["/api/tenants/acme"] = "x";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("acme");
    EntryRepository repo(&api);
    QSignalSpy bad(&repo, &EntryRepository::refreshFailed);
    repo.refresh();
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QVERIFY(!repo.isRefreshing());
    QVERIFY(!repo.isLoaded());
}

void TstEntryRepository::ensureDetailMergesAndNotifies()
{
    MiniHttp http;
    http.routes["/api/tenants/acme"] = R"({"id":7})";
    http.routes["/api/gamedep/catalog?tenant_id=7"] = kCatalog;
    http.routes["/api/gamedep/dep/d%201"] = R"({"name":"d 1","tags":["x"]})";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("acme");
    EntryRepository repo(&api);
    QSignalSpy changed(&repo, &EntryRepository::entryChanged);
    repo.ensureDetail("dep", "d 1"); // not in catalog yet: inserted
    repo.ensureDetail("dep", "d 1"); // in flight: no second request
    QTRY_COMPARE_WITH_TIMEOUT(changed.count(), 1, 5000);
    QCOMPARE(http.paths.count("/api/gamedep/dep/d%201"), 1);
    repo.ensureDetail("dep", "d 1"); // already loaded: notifies again
    QTRY_COMPARE_WITH_TIMEOUT(changed.count(), 2, 5000);
}

QTEST_MAIN(TstEntryRepository)
#include "qtst_EntryRepository_2.moc"
