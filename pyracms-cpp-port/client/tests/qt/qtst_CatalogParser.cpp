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
    void parsesApiCatalog();
};

void TstCatalogParser::parsesApiCatalog()
{
    const auto catalog = obj(R"({
      "games": [{"id":1,"name":"tetris",
                 "displayName":"Tetris","description":"blocks",
                 "viewCount":7,"createdAt":"2026-01-01T00:00:00",
                 "revisions":[{"id":3,"version":"1.0",
                  "moduleType":"folder","fileId":42,"published":true},
                              {"id":4,"version":"1.1",
                  "moduleType":"file","fileId":43,"published":false}]}],
      "deps": [{"id":2,"name":"pygame","displayName":"PyGame","revisions":[]}]
    })");
    const QList<GameEntry> all = CatalogParser::parseCatalog(catalog);
    QCOMPARE(all.size(), 2);

    const GameEntry& g = all.at(0);
    QCOMPARE(g.type, QString("game"));
    QCOMPARE(g.name, QString("tetris"));
    QCOMPARE(g.title(), QString("Tetris"));
    QCOMPARE(g.views, 7);
    QCOMPARE(g.revisions.size(), 2);
    QCOMPARE(g.revisions.at(0).fileRef, QString("42"));
    QCOMPARE(g.revisions.at(0).moduleType, QString("folder"));
    QVERIFY(g.revisions.at(0).published);
    QVERIFY(!g.revisions.at(1).published);
    QVERIFY(!g.detailLoaded);

    QCOMPARE(all.at(1).type, QString("dep"));
}

QTEST_APPLESS_MAIN(TstCatalogParser)
#include "qtst_CatalogParser.moc"
