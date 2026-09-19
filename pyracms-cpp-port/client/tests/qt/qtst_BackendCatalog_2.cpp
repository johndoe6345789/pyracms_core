#include <QtTest>

#include "Fixture.h"
#include "domain/BinarySelector.h"
#include "domain/CatalogParser.h"

using namespace Hypernucleus;

// Real /api/gamedep/catalog output of the live stack (demo tenant).

class TstBackendCatalog2 : public QObject {
    Q_OBJECT

private slots:
    void sourceOnlyRevisionHasNoFile();
    void parsesBinariesWithAllFields();
    void detailResponseMerges();
};

void TstBackendCatalog2::sourceOnlyRevisionHasNoFile()
{
    const auto list =
        CatalogParser::parseCatalog(fixtureJson("catalog_demo.json"));
    const RevisionInfo& r = list.first().revisions.first();
    QVERIFY(r.published);
    QVERIFY(r.binaries.isEmpty());
    const auto t = BinarySelector::resolveTarget(r, "game", "linux", "x86_64");
    QVERIFY(!t.ok);
}

void TstBackendCatalog2::parsesBinariesWithAllFields()
{
    const auto list =
        CatalogParser::parseCatalog(fixtureJson("catalog_binaries.json"));
    QCOMPARE(list.size(), 1);
    const GameEntry& g = list.first();
    QCOMPARE(g.screenshots.size(), 1);
    QCOMPARE(g.hero, g.screenshots.first()); // the default screenshot
    QCOMPARE(g.dependencies.at(1).source, QString("pyracms"));
    const auto& bins = g.revisions.first().binaries;
    QCOMPARE(bins.size(), 4);
    QCOMPARE(bins.first().os, QString("Windows"));
    QCOMPARE(bins.first().size, qint64(4096));
    QCOMPARE(bins.first().sha256.size(), 64);
    QCOMPARE(bins.first().executable, QString("snake.exe"));
    QVERIFY(bins.first().url.contains("/api/files/"));
    QVERIFY(!bins.first().fileRef.isEmpty());
    QCOMPARE(bins.at(3).downloads, qint64(4));
}

void TstBackendCatalog2::detailResponseMerges()
{
    auto list = CatalogParser::parseCatalog(fixtureJson("catalog_demo.json"));
    GameEntry* snake = nullptr;
    for (GameEntry& e : list)
        if (e.name == "snake") snake = &e;
    QVERIFY(snake);
    snake->owner.clear();
    CatalogParser::mergeDetail(*snake, fixtureJson("game_snake.json"));
    QCOMPARE(snake->owner, QString("admin"));
    QVERIFY(snake->detailLoaded);
}

QTEST_MAIN(TstBackendCatalog2)
#include "qtst_BackendCatalog_2.moc"
