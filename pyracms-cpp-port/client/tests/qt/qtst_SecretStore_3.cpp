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

class TstSecretStore3 : public QObject {
    Q_OBJECT

private slots:
    void portableModeUsesSessionStore();
    void platformBackend();
};

void TstSecretStore3::portableModeUsesSessionStore()
{
    TestEnv env; // sets HYPERNUCLEUS_HOME
    auto s = createPlatformSecretStore();
    QCOMPARE(s->backendName(), QString("memory"));
}

// Windows Credential Manager / macOS Keychain really store the secret; on
// Linux a keyring may or may not exist, so either it works or the vault
// falls back to memory - and the token never reaches a file.
void TstSecretStore3::platformBackend()
{
#if defined(Q_OS_WIN) || defined(Q_OS_MACOS)
    auto s = createNativeSecretStore();
    QVERIFY(s);
    const QString acc = "test-" + QUuid::createUuid().toString(QUuid::Id128);
    QVERIFY(s->write("HypernucleusTest", acc, "pässword-ü-123"));
    QCOMPARE(s->read("HypernucleusTest", acc), QString("pässword-ü-123"));
    QVERIFY(s->write("HypernucleusTest", acc, "second"));
    QCOMPARE(s->read("HypernucleusTest", acc), QString("second"));
    QVERIFY(s->remove("HypernucleusTest", acc));
    QCOMPARE(s->read("HypernucleusTest", acc), QString());
#else
    TestEnv env;
    QVERIFY(!createLibsecretStore("")->isAvailable());
    TokenVault none(createLibsecretStore(""));
    QVERIFY(!none.save("linux-secret"));
    QVERIFY(none.sessionOnly());
    QCOMPARE(none.load(), QString("linux-secret"));

    TokenVault real(createLibsecretStore());
    real.save("linux-secret");
    QCOMPARE(real.load(), QString("linux-secret"));
    QVERIFY(!anyFileContains(env.path(), "linux-secret"));
    real.clear();
#endif
}

QTEST_MAIN(TstSecretStore3)
#include "qtst_SecretStore_3.moc"
