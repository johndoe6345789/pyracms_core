#include <QtTest>

#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"

using namespace Hypernucleus;

class TstEntryRepository : public QObject {
    Q_OBJECT

private slots:
    void refreshLoadsApiCatalog();
    void refreshKeepsDetailsOfKnownEntries();
};

static const char* kCatalog = R"({
 "games":[{"name":"g1","displayName":"G1","revisions":
           [{"version":"1","fileId":5,"published":true}]}],
 "deps":[{"name":"d1","displayName":"D1","revisions":[]}]})";

void TstEntryRepository::refreshLoadsApiCatalog()
{
    MiniHttp http;
    http.routes["/api/outputs/json"] = kCatalog;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    EntryRepository repo(&api);
    QSignalSpy done(&repo, &EntryRepository::refreshed);
    QVERIFY(!repo.isLoaded());
    repo.refresh();
    QVERIFY(repo.isRefreshing());
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QVERIFY(repo.isLoaded());
    QVERIFY(!repo.isRefreshing());
    QCOMPARE(repo.entries("game").size(), 1);
    QCOMPARE(repo.entries().size(), 2);
    QCOMPARE(repo.find("d1")->type, QString("dep"));
}

void TstEntryRepository::refreshKeepsDetailsOfKnownEntries()
{
    MiniHttp http;
    http.routes["/api/outputs/json"] = kCatalog;
    http.routes["/api/gamedep/game/g1"] =
        R"({"name":"g1","tags":["a"],"dependencies":[{"name":"d1"}]})";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    EntryRepository repo(&api);
    QSignalSpy done(&repo, &EntryRepository::refreshed);
    QSignalSpy detail(&repo, &EntryRepository::entryChanged);
    repo.refresh();
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    repo.ensureDetail("game", "g1");
    QTRY_COMPARE_WITH_TIMEOUT(detail.count(), 1, 5000);
    repo.refresh();
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 2, 5000);
    const GameEntry* g = repo.find("g1", "game");
    QVERIFY(g->detailLoaded);
    QCOMPARE(g->dependencies.size(), 1);
    QCOMPARE(g->tags, QStringList{"a"});
    QCOMPARE(g->revisions.size(), 1); // fresh revisions
}

QTEST_MAIN(TstEntryRepository)
#include "qtst_EntryRepository.moc"
