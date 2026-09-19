#include <QtTest>

#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"

using namespace Hypernucleus;

class TstEntryRepositoryTenant : public QObject {
    Q_OBJECT

private slots:
    void unknownSiteIsReportedAndEmptiesTheList();
    void serverWithoutTenantsApiStillLoads();
};

static const char* kCat =
    R"({"gamedep":[{"game":{"name":"g1","displayName":"G1"}}]})";

void TstEntryRepositoryTenant::unknownSiteIsReportedAndEmptiesTheList()
{
    MiniHttp http; // every path answers 404
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("nope");
    EntryRepository repo(&api);
    GameEntry old;
    old.name = "old";
    old.type = "game";
    repo.setEntries({old});
    QSignalSpy failed(&repo, &EntryRepository::refreshFailed);
    repo.refresh();
    QTRY_COMPARE_WITH_TIMEOUT(failed.count(), 1, 5000);
    QVERIFY(failed.at(0).at(0).toString().contains("\"nope\" was not found"));
    QVERIFY(!repo.isRefreshing());
    QVERIFY(repo.entries().isEmpty());
}

void TstEntryRepositoryTenant::serverWithoutTenantsApiStillLoads()
{
    MiniHttp http;
    http.routes["/api/tenants/acme"] = "oops";
    http.statuses["/api/tenants/acme"] = 500;
    http.routes["/api/outputs/json"] = kCat;
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
#include "qtst_EntryRepository_5.moc"
