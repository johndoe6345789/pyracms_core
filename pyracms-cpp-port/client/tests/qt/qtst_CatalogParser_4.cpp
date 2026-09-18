#include <QtTest>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>

#include "domain/CatalogParser.h"
#include "domain/VersionCompare.h"

using namespace Hypernucleus;

static QJsonObject obj(const char* json)
{
    return QJsonDocument::fromJson(json).object();
}

class TstCatalogParser : public QObject {
    Q_OBJECT

private slots:
    void mergeKeepsListData();
    void normalizesTypes();
    void skipsNamelessEntries();
};

void TstCatalogParser::mergeKeepsListData()
{
    GameEntry e = CatalogParser::parseEntry(
        obj(R"({"name":"a","displayName":"A","description":"from list",
                "viewCount":5,
                "revisions":[{"version":"1","fileId":1}]})"),
        "game");
    CatalogParser::mergeDetail(
        e, obj(R"({"name":"a","description":"","tags":["x"],
        "dependencies":[{"name":"d"}],"revisions":[]})"));
    QCOMPARE(e.description,
             QString("from list")); // empty detail text does not erase it
    QCOMPARE(e.views, 5);
    QCOMPARE(e.revisions.size(), 1); // empty revision list does not erase them
    QCOMPARE(e.tags, QStringList{"x"});
    QCOMPARE(e.dependencies.size(), 1);
    QVERIFY(e.detailLoaded);
}

void TstCatalogParser::normalizesTypes()
{
    QCOMPARE(CatalogParser::normalizeType("dependency"), QString("dep"));
    QCOMPARE(CatalogParser::normalizeType("DEP"), QString("dep"));
    QCOMPARE(CatalogParser::normalizeType("game"), QString("game"));
    QCOMPARE(CatalogParser::normalizeType(""), QString("game"));
}

void TstCatalogParser::skipsNamelessEntries()
{
    const QList<GameEntry> all = CatalogParser::parseCatalog(
        obj(R"({"games":[{"displayName":"no name"},{"name":"ok"}]})"));
    QCOMPARE(all.size(), 1);
    QCOMPARE(all.at(0).name, QString("ok"));
}

QTEST_APPLESS_MAIN(TstCatalogParser)
#include "qtst_CatalogParser_4.moc"
