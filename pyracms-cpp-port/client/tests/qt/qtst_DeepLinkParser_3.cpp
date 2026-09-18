#include <QtTest>

#include "domain/DeepLinkParser.h"

using namespace Hypernucleus;

class TstDeepLinkParser : public QObject {
    Q_OBJECT

private slots:
    void findsLinkInArguments();
};

void TstDeepLinkParser::findsLinkInArguments()
{
    QCOMPARE(DeepLinkParser::findInArguments(
                 {"app", "--flag", "pyracms://launch/a/b"}),
             QString("pyracms://launch/a/b"));
    QCOMPARE(DeepLinkParser::findInArguments({"app", "PyraCMS://install/a/b"}),
             QString("PyraCMS://install/a/b"));
    QVERIFY(DeepLinkParser::findInArguments({"app", "https://example.com"})
                .isEmpty());
    QVERIFY(DeepLinkParser::findInArguments({}).isEmpty());
}

QTEST_APPLESS_MAIN(TstDeepLinkParser)
#include "qtst_DeepLinkParser_3.moc"
