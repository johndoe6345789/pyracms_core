#include <QtTest>

#include "domain/ServerUrl.h"

using namespace Hypernucleus;

class TstServerUrl : public QObject {
    Q_OBJECT

private slots:
    void rememberPutsNewestFirstAndDedupes();
    void rememberIgnoresInvalidAndCaps();
    void choicesListPresetsThenRecent();
};

void TstServerUrl::rememberPutsNewestFirstAndDedupes()
{
    QStringList r = ServerUrl::remember({}, "https://a.example/");
    r = ServerUrl::remember(r, "https://b.example");
    r = ServerUrl::remember(r, "HTTPS://A.EXAMPLE");
    QCOMPARE(r, (QStringList{"https://a.example", "https://b.example"}));
}

void TstServerUrl::rememberIgnoresInvalidAndCaps()
{
    QStringList r{"https://keep.example"};
    QCOMPARE(ServerUrl::remember(r, "garbage"), r);
    r.clear();
    for (int i = 0; i < ServerUrl::MaxRecent + 3; ++i)
        r = ServerUrl::remember(r, QString("https://s%1.example").arg(i));
    QCOMPARE(r.size(), ServerUrl::MaxRecent);
    QCOMPARE(r.first(), QString("https://s10.example"));
}

void TstServerUrl::choicesListPresetsThenRecent()
{
    const QStringList c = ServerUrl::choices(
        {"https://mine.example", "http://localhost:3199"});
    QCOMPARE(c, (QStringList{"http://localhost:3199",
                             "https://pyracms.pynguins.xyz",
                             "https://mine.example"}));
}

QTEST_APPLESS_MAIN(TstServerUrl)
#include "qtst_ServerUrl_2.moc"
