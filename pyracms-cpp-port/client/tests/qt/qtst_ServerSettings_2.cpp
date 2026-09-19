#include <QtTest>

#include "TestEnv.h"
#include "services/SettingsManager.h"

using namespace Hypernucleus;

class TstServerSettings : public QObject {
    Q_OBJECT

private slots:
    void choicesStartWithPresets();
    void oldBackendPortDefaultIsMigrated();
    void resetForgetsRecentServers();
};

void TstServerSettings::choicesStartWithPresets()
{
    TestEnv env;
    SettingsManager s;
    s.rememberServer("https://mine.example");
    const QStringList c = s.serverChoices();
    QCOMPARE(c.value(0), QString("http://localhost:3199"));
    QCOMPARE(c.value(1), QString("https://pyracms.pynguins.xyz"));
    QCOMPARE(c.last(), QString("https://mine.example"));
}

void TstServerSettings::oldBackendPortDefaultIsMigrated()
{
    TestEnv env;
    SettingsManager a;
    a.setRepoUrl("http://localhost:8080");
    a.save();
    SettingsManager b;
    b.load();
    QCOMPARE(b.repoUrl(), QString("http://localhost:3199"));
}

void TstServerSettings::resetForgetsRecentServers()
{
    TestEnv env;
    SettingsManager s;
    s.rememberServer("https://one.example");
    s.reset();
    QVERIFY(s.recentServers().isEmpty());
    SettingsManager again;
    again.load();
    QVERIFY(again.recentServers().isEmpty());
}

QTEST_APPLESS_MAIN(TstServerSettings)
#include "qtst_ServerSettings_2.moc"
