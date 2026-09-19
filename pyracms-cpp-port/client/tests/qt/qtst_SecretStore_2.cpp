#include <QtTest>
#include <QDirIterator>
#include <QUuid>

#include "SecretFakes.h"
#include "TestEnv.h"
#include "services/ApiClient.h"
#include "services/AuthService.h"
#include "services/SecretStore.h"
#include "services/SettingsManager.h"
#include "services/TokenVault.h"

using namespace Hypernucleus;

class TstSecretStore2 : public QObject {
    Q_OBJECT

private slots:
    void authServiceKeepsTokenOutOfSettings();
    void authServiceWarnsWithoutKeychain();
};

void TstSecretStore2::authServiceKeepsTokenOutOfSettings()
{
    TestEnv env;
    QSettings().setValue("auth/token", "old-plain");
    QSettings().setValue("auth/username", "richard");
    ApiClient api;
    SettingsManager settings;
    AuthService auth(&api, &settings, std::make_unique<MemorySecretStore>());
    auth.restoreSession();
    QVERIFY(auth.isAuthenticated());
    QCOMPARE(auth.token(), QString("old-plain"));
    QVERIFY(!QSettings().contains("auth/token"));
    QVERIFY(!anyFileContains(env.path(), "old-plain"));
    auth.logout();
    QVERIFY(!auth.isAuthenticated());
    QVERIFY(auth.vault().sessionOnly() == false);
}

void TstSecretStore2::authServiceWarnsWithoutKeychain()
{
    TestEnv env;
    QSettings().setValue("auth/token", "session-token");
    QSettings().setValue("auth/username", "richard");
    ApiClient api;
    SettingsManager settings;
    AuthService auth(&api, &settings, std::make_unique<BrokenStore>());
    QSignalSpy warn(&auth, &AuthService::secureStorageUnavailable);
    auth.restoreSession();
    QVERIFY(auth.isAuthenticated()); // still signed in for this session
    QCOMPARE(warn.count(), 1);
    QVERIFY(auth.vault().sessionOnly());
    QVERIFY(!anyFileContains(env.path(), "session-token"));
}

QTEST_MAIN(TstSecretStore2)
#include "qtst_SecretStore_2.moc"
