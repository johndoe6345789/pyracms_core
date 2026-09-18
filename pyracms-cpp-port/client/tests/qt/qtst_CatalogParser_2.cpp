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
    void parsesLegacyManifest();
};

void TstCatalogParser::parsesLegacyManifest()
{
    // Format of the original Hypernucleus server (hypernucleus_server
    // outputlib.py)
    const auto catalog = obj(R"({
      "operatingsystems":[{"name":"linux","display_name":"Linux"}],
      "architectures":[{"name":"x86_64","display_name":"64 bit"}],
      "gamedep":[
        {"game":{"name":"racer","display_name":"Racer","description":"vroom",
                 "dependencies":[{"dependency":"pygame","version":"1.9"}],
                 "tags":["arcade","", "racing"],
                 "pictures":[{"url":"http://x/a.png",
                  "thumb_url":"http://x/t.png","default":false,"uuid":"u1"},
                             {"url":"http://x/b.png",
                  "default":true,"uuid":"u2"}],
                 "revisions":[{"version":"0.5",
                  "moduletype":"folder","source":"http://x/racer.zip",
                               "source_uuid":"su1","binaries":[]}]}},
        {"dependency":{"name":"pygame","display_name":"PyGame","revisions":[
                 {"version":"1.9","moduletype":"file","binaries":[
                    {"binary":"http://x/pg-pi.zip",
                     "operating_system":"pi","architecture":"pi","uuid":"b1"},
                    {"binary":"http://x/pg-lin.zip",
                     "operating_system":"linux",
                     "architecture":"x86_64","uuid":"b2"}]}]}}
      ]})");
    const QList<GameEntry> all = CatalogParser::parseCatalog(catalog);
    QCOMPARE(all.size(), 2);

    const GameEntry& g = all.at(0);
    QCOMPARE(g.name, QString("racer"));
    QCOMPARE(g.displayName, QString("Racer"));
    QCOMPARE(g.tags, (QStringList{"arcade", "racing"})); // blanks dropped
    QCOMPARE(g.dependencies.size(), 1);
    QCOMPARE(g.dependencies.at(0).name, QString("pygame"));
    QCOMPARE(g.dependencies.at(0).version, QString("1.9"));
    QCOMPARE(g.screenshots.size(), 2);
    QCOMPARE(g.hero,
             QString("http://x/b.png")); // default picture becomes the hero
    QCOMPARE(g.revisions.at(0).url, QString("http://x/racer.zip"));
    QCOMPARE(g.revisions.at(0).fileRef, QString("su1"));
    QVERIFY(g.detailLoaded); // legacy manifests are complete

    const GameEntry& d = all.at(1);
    QCOMPARE(d.type, QString("dep"));
    QCOMPARE(d.revisions.at(0).binaries.size(), 2);
    QCOMPARE(d.revisions.at(0).binaries.at(0).os, QString("pi"));
    QCOMPARE(d.revisions.at(0).binaries.at(1).url,
             QString("http://x/pg-lin.zip"));
    QCOMPARE(d.revisions.at(0).binaries.at(1).arch, QString("x86_64"));
}

QTEST_APPLESS_MAIN(TstCatalogParser)
#include "qtst_CatalogParser_2.moc"
