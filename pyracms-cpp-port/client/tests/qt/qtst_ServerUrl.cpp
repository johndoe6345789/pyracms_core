#include <QtTest>

#include "domain/ServerUrl.h"

using namespace Hypernucleus;

class TstServerUrl : public QObject {
    Q_OBJECT

private slots:
    void presetsAreLocalStackAndPublicSite();
    void normalizeAcceptsHttpAndHttpsOnly();
    void normalizeAcceptsHttpAndHttpsOnly_data();
    void errorExplainsWhatIsWrong();
};

void TstServerUrl::presetsAreLocalStackAndPublicSite()
{
    const QStringList p = ServerUrl::presets();
    QCOMPARE(p.value(0), QString("http://localhost:3199"));
    QCOMPARE(p.value(1), QString("https://pyracms.pynguins.xyz"));
}

void TstServerUrl::normalizeAcceptsHttpAndHttpsOnly_data()
{
    QTest::addColumn<QString>("in");
    QTest::addColumn<QString>("out");
    QTest::newRow("plain") << "http://localhost:3199"
                           << "http://localhost:3199";
    QTest::newRow("case") << "HTTPS://A.Example" << "https://a.example";
    QTest::newRow("slash") << " https://a.example/ "
                           << "https://a.example";
    QTest::newRow("path") << "https://a.example/pyra/"
                          << "https://a.example/pyra";
    QTest::newRow("ftp") << "ftp://a.example" << "";
    QTest::newRow("bare host") << "a.example" << "";
    QTest::newRow("no host") << "http://" << "";
    QTest::newRow("query") << "https://a.example/?x=1" << "";
    QTest::newRow("credentials") << "https://u:p@a.example" << "";
    QTest::newRow("empty") << "   " << "";
}

void TstServerUrl::normalizeAcceptsHttpAndHttpsOnly()
{
    QFETCH(QString, in);
    QFETCH(QString, out);
    QCOMPARE(ServerUrl::normalize(in), out);
}

void TstServerUrl::errorExplainsWhatIsWrong()
{
    QVERIFY(ServerUrl::error("https://ok.example").isEmpty());
    QVERIFY(ServerUrl::error("").contains("Enter"));
    QVERIFY(ServerUrl::error("nope").contains("https://"));
}

QTEST_APPLESS_MAIN(TstServerUrl)
#include "qtst_ServerUrl.moc"
