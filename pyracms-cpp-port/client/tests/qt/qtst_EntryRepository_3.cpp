#include <QtTest>

#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"

using namespace Hypernucleus;

class TstEntryRepository : public QObject {
    Q_OBJECT

private slots:
    void ensureDetailFailureIsReported();
    void findAndTags();
};

static const char* kCatalog = R"({
 "games":[{"name":"g1","displayName":"G1","revisions":
           [{"version":"1","fileId":5,"published":true}]}],
 "deps":[{"name":"d1","displayName":"D1","revisions":[]}]})";

void TstEntryRepository::ensureDetailFailureIsReported()
{
    MiniHttp http;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    EntryRepository repo(&api);
    QSignalSpy bad(&repo, &EntryRepository::detailFailed);
    repo.ensureDetail("game", "ghost");
    QTRY_COMPARE_WITH_TIMEOUT(bad.count(), 1, 5000);
    QCOMPARE(bad.at(0).at(1).toString(), QString("ghost"));
}

void TstEntryRepository::findAndTags()
{
    ApiClient api;
    EntryRepository repo(&api);
    GameEntry a;
    a.name = "x";
    a.type = "game";
    a.tags = {"b", "A"};
    GameEntry d = a;
    d.type = "dep";
    d.tags = {"z"};
    repo.setEntries({a, d});
    QCOMPARE(repo.allTags("game"), (QStringList{"A", "b"}));
    QCOMPARE(repo.allTags().size(), 3);
    QCOMPARE(repo.find("x")->type, QString("game")); // game wins
    QVERIFY(repo.find("nope") == nullptr);
}

QTEST_MAIN(TstEntryRepository)
#include "qtst_EntryRepository_3.moc"
