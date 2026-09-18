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
    void versionCompare_data();
    void versionCompare();
};

void TstCatalogParser::versionCompare_data()
{
    QTest::addColumn<QString>("a");
    QTest::addColumn<QString>("b");
    QTest::addColumn<int>("sign");

    QTest::newRow("equal") << "1.0" << "1.0" << 0;
    QTest::newRow("padding") << "1" << "1.0.0" << 0;
    QTest::newRow("numeric not text") << "1.10" << "1.9" << 1;
    QTest::newRow("less") << "0.9" << "1.0" << -1;
    QTest::newRow("patch") << "1.0.1" << "1.0" << 1;
    QTest::newRow("dash") << "2.0-1" << "2.0-2" << -1;
    QTest::newRow("text tail") << "1.0a" << "1.0b" << -1;
}

void TstCatalogParser::versionCompare()
{
    QFETCH(QString, a);
    QFETCH(QString, b);
    QFETCH(int, sign);
    const int c = VersionCompare::compare(a, b);
    QCOMPARE(c < 0 ? -1 : (c > 0 ? 1 : 0), sign);
    const int rev = VersionCompare::compare(b, a);
    QCOMPARE(rev < 0 ? -1 : (rev > 0 ? 1 : 0), -sign);
}

QTEST_APPLESS_MAIN(TstCatalogParser)
#include "qtst_CatalogParser_6.moc"
