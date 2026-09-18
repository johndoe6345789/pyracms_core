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
    void parsesDetailExtras();
    void listRowIsNotDetailed();
};

void TstCatalogParser::parsesDetailExtras()
{
    const auto detail = obj(R"({
      "name":"tetris","displayName":"Tetris","type":"game",
      "tags":[{"name":"puzzle"},"classic"],
      "screenshots":[{"id":"s1","src":"/api/files/s1","title":"one"},"s2"],
      "dependencies":[{"name":"pygame","version":"2.0"},
                      {"name":"requests","source":"pip","version":"2.31"},
                      {"name":"oddlib","source":"bogus"}],
      "requirements":["numpy>=1.20","# comment-like"],
      "pip":"pillow\n\nscipy",
      "revisions":[{"version":"1.0","binaries":[
         {"os":"windows","arch":"x86_64",
           "fileId":9,"size":"1024",
           "sha256":"SHA256:ABCD","executable":"t.exe"}]}]
    })");
    const GameEntry e = CatalogParser::parseEntry(detail, QString());
    QVERIFY(e.detailLoaded);
    QCOMPARE(e.type, QString("game"));
    QCOMPARE(e.tags, (QStringList{"puzzle", "classic"}));
    QCOMPARE(e.screenshots, (QStringList{"/api/files/s1", "s2"}));
    QCOMPARE(e.dependencies.size(), 3);
    QCOMPARE(e.dependencies.at(1).source, QString("pip"));
    QCOMPARE(e.dependencies.at(1).version, QString("2.31"));
    QCOMPARE(e.dependencies.at(2).source,
             QString()); // unknown override ignored
    QVERIFY(e.pipRequirements.contains("numpy>=1.20"));
    QVERIFY(e.pipRequirements.contains("pillow"));
    QVERIFY(e.pipRequirements.contains("scipy"));

    const BinaryInfo& b = e.revisions.at(0).binaries.at(0);
    QCOMPARE(b.fileRef, QString("9"));
    QCOMPARE(b.size, qint64(1024));
    QCOMPARE(b.sha256, QString("abcd")); // prefix stripped, lowercased
    QCOMPARE(b.executable, QString("t.exe"));
}

void TstCatalogParser::listRowIsNotDetailed()
{
    const GameEntry e = CatalogParser::parseEntry(
        obj(R"({"name":"a","displayName":"A","description":"d"})"), "game");
    QVERIFY(!e.detailLoaded);
}

QTEST_APPLESS_MAIN(TstCatalogParser)
#include "qtst_CatalogParser_3.moc"
