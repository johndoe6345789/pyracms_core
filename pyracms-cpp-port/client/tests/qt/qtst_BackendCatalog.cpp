#include <QtTest>

#include "Fixture.h"
#include "domain/BinarySelector.h"
#include "domain/CatalogParser.h"

using namespace Hypernucleus;

// Real /api/gamedep/catalog output of the live stack (demo tenant).
class TstBackendCatalog : public QObject {
    Q_OBJECT

private slots:
    void parsesEverySeededGame();
    void readsDependencyKindsTagsOwner();
};

void TstBackendCatalog::parsesEverySeededGame()
{
    const auto list =
        CatalogParser::parseCatalog(fixtureJson("catalog_demo.json"));
    QCOMPARE(list.size(), 6);
    QStringList names;
    for (const GameEntry& e : list) names << e.name;
    QVERIFY(names.contains("snake"));
    QVERIFY(names.contains("twenty48"));
    QCOMPARE(list.first().type, QString("game"));
    QVERIFY(list.first().detailLoaded);
}

void TstBackendCatalog::readsDependencyKindsTagsOwner()
{
    const auto list =
        CatalogParser::parseCatalog(fixtureJson("catalog_demo.json"));
    const GameEntry* snake = nullptr;
    for (const GameEntry& e : list)
        if (e.name == "snake") snake = &e;
    QVERIFY(snake);
    QCOMPARE(snake->owner, QString("admin"));
    QCOMPARE(snake->tags, (QStringList{"arcade", "classic", "pygame"}));
    QCOMPARE(snake->dependencies.size(), 1);
    QCOMPARE(snake->dependencies.first().source, QString("pip"));
    QCOMPARE(snake->dependencies.first().version, QString("==2.6.1"));
    QCOMPARE(snake->pipRequirements, QStringList{"pygame==2.6.1"});
}

QTEST_MAIN(TstBackendCatalog)
#include "qtst_BackendCatalog.moc"
