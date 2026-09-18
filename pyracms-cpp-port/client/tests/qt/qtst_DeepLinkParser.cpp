#include <QtTest>

#include "domain/DeepLinkParser.h"

using namespace Hypernucleus;

class TstDeepLinkParser : public QObject {
    Q_OBJECT

private slots:
    void parsesValidLinks_data();
    void parsesValidLinks();
};

void TstDeepLinkParser::parsesValidLinks_data()
{
    QTest::addColumn<QString>("url");
    QTest::addColumn<int>("action");
    QTest::addColumn<QString>("slug");
    QTest::addColumn<QString>("name");

    const int launch = static_cast<int>(DeepLink::Action::Launch);
    const int install = static_cast<int>(DeepLink::Action::Install);
    QTest::newRow("launch")
        << "pyracms://launch/acme/tetris" << launch << "acme" << "tetris";
    QTest::newRow("install")
        << "pyracms://install/acme/tetris" << install << "acme" << "tetris";
    QTest::newRow("trailing slash")
        << "pyracms://launch/acme/tetris/" << launch << "acme" << "tetris";
    QTest::newRow("uppercase scheme+action")
        << "PYRACMS://Launch/Acme/Tetris" << launch << "Acme" << "Tetris";
    QTest::newRow("percent encoded")
        << "pyracms://install/my%20site/space%20game" << install << "my site"
        << "space game";
    QTest::newRow("dots and dashes") << "pyracms://launch/a-b.c/my_game-2.0"
                                     << launch << "a-b.c" << "my_game-2.0";
    QTest::newRow("surrounding whitespace")
        << "  pyracms://launch/acme/tetris \n"
        << launch << "acme" << "tetris";
}

void TstDeepLinkParser::parsesValidLinks()
{
    QFETCH(QString, url);
    QFETCH(int, action);
    QFETCH(QString, slug);
    QFETCH(QString, name);

    const DeepLink link = DeepLinkParser::parse(url);
    QVERIFY2(link.isValid(), qPrintable(link.error));
    QCOMPARE(static_cast<int>(link.action), action);
    QCOMPARE(link.slug, slug);
    QCOMPARE(link.name, name);
}

QTEST_APPLESS_MAIN(TstDeepLinkParser)
#include "qtst_DeepLinkParser.moc"
