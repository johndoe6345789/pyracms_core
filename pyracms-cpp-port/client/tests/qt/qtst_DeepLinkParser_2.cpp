#include <QtTest>

#include "domain/DeepLinkParser.h"

using namespace Hypernucleus;

class TstDeepLinkParser : public QObject {
    Q_OBJECT

private slots:
    void rejectsInvalidLinks_data();
    void rejectsInvalidLinks();
    void buildRoundTrips();
};

void TstDeepLinkParser::rejectsInvalidLinks_data()
{
    QTest::addColumn<QString>("url");

    QTest::newRow("empty") << "";
    QTest::newRow("wrong scheme") << "https://launch/acme/tetris";
    QTest::newRow("no scheme") << "launch/acme/tetris";
    QTest::newRow("unknown action") << "pyracms://delete/acme/tetris";
    QTest::newRow("missing name") << "pyracms://launch/acme";
    QTest::newRow("missing everything") << "pyracms://launch";
    QTest::newRow("too many segments") << "pyracms://launch/acme/tetris/extra";
    QTest::newRow("dot dot name") << "pyracms://launch/acme/..";
    QTest::newRow("encoded dot dot") << "pyracms://launch/acme/%2e%2e";
    QTest::newRow("dot dot inside") << "pyracms://launch/acme/a..b";
    QTest::newRow("encoded slash in name") << "pyracms://launch/acme/a%2Fb";
    QTest::newRow("encoded backslash") << "pyracms://launch/acme/a%5Cb";
    QTest::newRow("encoded slash in slug") << "pyracms://launch/a%2Fb/tetris";
    QTest::newRow("control character") << "pyracms://launch/acme/a%00b";
    QTest::newRow("newline") << "pyracms://launch/acme/a%0Ab";
    QTest::newRow("too long") << ("pyracms://launch/acme/" + QString(200, 'x'));
    QTest::newRow("query only") << "pyracms://launch/?x=1";
}

void TstDeepLinkParser::rejectsInvalidLinks()
{
    QFETCH(QString, url);
    const DeepLink link = DeepLinkParser::parse(url);
    QVERIFY(!link.isValid());
    QVERIFY(!link.error.isEmpty());
    QCOMPARE(link.action, DeepLink::Action::None);
}

void TstDeepLinkParser::buildRoundTrips()
{
    const QString url =
        DeepLinkParser::build(DeepLink::Action::Install, "my site", "a/b game");
    QCOMPARE(url, QString("pyracms://install/my%20site/a%2Fb%20game"));
    // a/b is unsafe for the parser, so build() output for it is rejected...
    QVERIFY(!DeepLinkParser::parse(url).isValid());

    const QString ok = DeepLinkParser::build(DeepLink::Action::Launch,
                                             "my site", "space game");
    const DeepLink link = DeepLinkParser::parse(ok);
    QVERIFY(link.isValid());
    QCOMPARE(link.slug, QString("my site"));
    QCOMPARE(link.name, QString("space game"));
    QCOMPARE(link.actionName(), QString("launch"));
}

QTEST_APPLESS_MAIN(TstDeepLinkParser)
#include "qtst_DeepLinkParser_2.moc"
