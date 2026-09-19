#include <QtTest>

#include "TestEnv.h"
#include "services/SettingsManager.h"

using namespace Hypernucleus;

class TstServerSettings : public QObject {
    Q_OBJECT

private slots:
    void defaultServerIsTheLocalStack();
    void rememberedServersPersistNewestFirst();
    void rememberDedupesAndSignals();
};

void TstServerSettings::defaultServerIsTheLocalStack()
{
    TestEnv env;
    SettingsManager s;
    QCOMPARE(s.repoUrl(), QString("http://localhost:3199"));
    QVERIFY(s.recentServers().isEmpty());
}

void TstServerSettings::rememberedServersPersistNewestFirst()
{
    TestEnv env;
    SettingsManager a;
    a.rememberServer("https://one.example");
    a.rememberServer("https://two.example/");
    a.save();
    SettingsManager b;
    b.load();
    QCOMPARE(b.recentServers(), (QStringList{"https://two.example",
                                             "https://one.example"}));
}

void TstServerSettings::rememberDedupesAndSignals()
{
    TestEnv env;
    SettingsManager s;
    QSignalSpy spy(&s, &SettingsManager::recentServersChanged);
    s.rememberServer("https://one.example");
    s.rememberServer("https://one.example/");
    s.rememberServer("not a url");
    QCOMPARE(spy.count(), 1);
    s.rememberServer("https://two.example");
    s.rememberServer("https://one.example");
    QCOMPARE(s.recentServers().first(), QString("https://one.example"));
    QCOMPARE(s.recentServers().size(), 2);
}

QTEST_APPLESS_MAIN(TstServerSettings)
#include "qtst_ServerSettings.moc"
