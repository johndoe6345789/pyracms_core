#include <QtTest>

#include "AppFixture.h"
#include "models/GameFilterModel.h"
#include "services/AuthService.h"
#include "viewmodels/ConnectController.h"

using namespace Hypernucleus;

class TstUiConnect : public QObject {
    Q_OBJECT

private slots:
    void needsConnectUntilASiteIsChosen();
    void connectRejectsBadServerOrEmptySite();
    void connectAppliesAndRemembersTheServer();
};

void TstUiConnect::needsConnectUntilASiteIsChosen()
{
    TestEnv env;
    MainViewModel vm(nullptr);
    QVERIFY(vm.connection()->needsConnect());
    QCOMPARE(vm.connection()->servers().size(), 2); // presets only
    vm.settings()->setTenantSlug("acme");
    QVERIFY(!vm.connection()->needsConnect());
}

void TstUiConnect::connectRejectsBadServerOrEmptySite()
{
    TestEnv env;
    MainViewModel vm(nullptr);
    auto* c = vm.connection();
    QVERIFY(!c->connectTo("nonsense", "acme"));
    QVERIFY(!c->connectTo("https://ok.example", "  "));
    QVERIFY(vm.settings()->tenantSlug().isEmpty());
    QVERIFY(!c->serverError("nonsense").isEmpty());
    QVERIFY(c->serverError("https://ok.example").isEmpty());
}

void TstUiConnect::connectAppliesAndRemembersTheServer()
{
    TestEnv env;
    MainViewModel vm(nullptr);
    QSignalSpy servers(vm.connection(), &ConnectController::serversChanged);
    QVERIFY(vm.connection()->connectTo(" https://games.example/ ", " acme "));
    QCOMPARE(vm.settings()->repoUrl(), QString("https://games.example"));
    QCOMPARE(vm.settings()->tenantSlug(), QString("acme"));
    QCOMPARE(servers.count(), 1);
    QCOMPARE(vm.connection()->servers().last().toMap()["value"].toString(),
             QString("https://games.example"));
    SettingsManager saved;
    saved.load();
    QCOMPARE(saved.tenantSlug(), QString("acme"));
    QCOMPARE(saved.recentServers(),
             QStringList{"https://games.example"});
}

QTEST_MAIN(TstUiConnect)
#include "qtst_UiConnect.moc"
