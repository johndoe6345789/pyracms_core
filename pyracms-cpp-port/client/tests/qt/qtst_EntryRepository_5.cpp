#include <QtTest>

#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"

using namespace Hypernucleus;

class TstEntryRepositoryTenant : public QObject {
    Q_OBJECT

private slots:
    void unknownSiteIsReportedAndEmptiesTheList();
    void tenantLookupFails();
    void noSiteMeansNoRequestAndNoError();
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

void TstEntryRepositoryTenant::tenantLookupFails()
{
    MiniHttp http;
    http.routes["/api/tenants/acme"] = "oops";
    http.statuses["/api/tenants/acme"] = 500;
    http.routes["/api/outputs/json"] = kCat;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("acme");
    EntryRepository repo(&api);
    QSignalSpy failed(&repo, &EntryRepository::refreshFailed);
    repo.refresh();
    QTRY_COMPARE_WITH_TIMEOUT(failed.count(), 1, 5000);
    QCOMPARE(http.paths, (QList<QString>{"/api/tenants/acme"}));
    QVERIFY(repo.entries().isEmpty());
}

void TstEntryRepositoryTenant::noSiteMeansNoRequestAndNoError()
{
    MiniHttp http;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    EntryRepository repo(&api);
    QSignalSpy done(&repo, &EntryRepository::refreshed);
    QSignalSpy failed(&repo, &EntryRepository::refreshFailed);
    repo.refresh();
    QCOMPARE(done.count(), 1);
    QCOMPARE(failed.count(), 0);
    QVERIFY(!repo.isRefreshing());
    QTest::qWait(100);
    QVERIFY(http.paths.isEmpty());
}

QTEST_MAIN(TstEntryRepositoryTenant)
#include "qtst_EntryRepository_5.moc"
