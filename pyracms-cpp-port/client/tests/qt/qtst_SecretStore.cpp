#include <QtTest>
#include <QDirIterator>
#include <QUuid>

#include "TestEnv.h"
#include "services/ApiClient.h"
#include "services/AuthService.h"
#include "services/SecretStore.h"
#include "services/SettingsManager.h"
#include "services/TokenVault.h"

using namespace Hypernucleus;

namespace {

// A keychain that refuses everything (locked, missing, no Secret Service).
class BrokenStore : public SecretStore {
public:
    QString backendName() const override { return "broken"; }
    bool isAvailable() const override { return true; }
    bool write(const QString&, const QString&, const QString&) override
    {
        return false;
    }
    QString read(const QString&, const QString&) override { return {}; }
    bool remove(const QString&, const QString&) override { return false; }
};

// Does any file below `dir` contain `needle`?
bool anyFileContains(const QString& dir, const QByteArray& needle)
{
    QDirIterator it(dir, QDir::Files, QDirIterator::Subdirectories);
    while (it.hasNext()) {
        QFile f(it.next());
        if (f.open(QIODevice::ReadOnly) && f.readAll().contains(needle))
            return true;
    }
    return false;
}

} // namespace

class TstSecretStore : public QObject {
    Q_OBJECT

private slots:
    void memoryStoreRoundTrip();
    void vaultUsesTheKeychainWhenItWorks();
    void vaultFallsBackToSessionMemory();
    void migratesPlaintextTokenAndDeletesIt();
    void authServiceKeepsTokenOutOfSettings();
    void authServiceWarnsWithoutKeychain();
    void portableModeUsesSessionStore();
    void platformBackend();
};

void TstSecretStore::memoryStoreRoundTrip()
{
    MemorySecretStore s;
    QVERIFY(s.isAvailable());
    QVERIFY(s.write("svc", "acc", "t0k"));
    QCOMPARE(s.read("svc", "acc"), QString("t0k"));
    QCOMPARE(s.read("svc", "other"), QString());
    QVERIFY(s.remove("svc", "acc"));
    QVERIFY(!s.remove("svc", "acc"));
    QCOMPARE(s.read("svc", "acc"), QString());
}

void TstSecretStore::vaultUsesTheKeychainWhenItWorks()
{
    auto store = std::make_unique<MemorySecretStore>();
    MemorySecretStore* raw = store.get();
    TokenVault v(std::move(store));
    QVERIFY(v.save("abc"));
    QVERIFY(!v.sessionOnly());
    QCOMPARE(raw->read(TokenVault::service(), TokenVault::account()),
             QString("abc"));
    QCOMPARE(v.load(), QString("abc"));
    v.clear();
    QCOMPARE(v.load(), QString());
}

void TstSecretStore::vaultFallsBackToSessionMemory()
{
    TokenVault v(std::make_unique<BrokenStore>());
    QVERIFY(!v.save("abc"));
    QVERIFY(v.sessionOnly());
    QCOMPARE(v.backendName(), QString("memory"));
    QCOMPARE(v.load(), QString("abc"));
    v.clear();
    QCOMPARE(v.load(), QString());
}

void TstSecretStore::migratesPlaintextTokenAndDeletesIt()
{
    TestEnv env;
    QSettings qs;
    qs.setValue("auth/token", "legacy-secret");
    qs.setValue("auth/username", "richard");
    auto store = std::make_unique<MemorySecretStore>();
    MemorySecretStore* raw = store.get();
    TokenVault v(std::move(store));
    QVERIFY(v.migrateFromSettings(qs));
    QVERIFY(!qs.contains("auth/token"));
    QCOMPARE(qs.value("auth/username").toString(), QString("richard"));
    QCOMPARE(raw->read(TokenVault::service(), TokenVault::account()),
             QString("legacy-secret"));
    QVERIFY(!v.migrateFromSettings(qs)); // one-time
    qs.sync();
    QVERIFY(!anyFileContains(env.path(), "legacy-secret"));
}

void TstSecretStore::authServiceKeepsTokenOutOfSettings()
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

void TstSecretStore::authServiceWarnsWithoutKeychain()
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

void TstSecretStore::portableModeUsesSessionStore()
{
    TestEnv env; // sets HYPERNUCLEUS_HOME
    auto s = createPlatformSecretStore();
    QCOMPARE(s->backendName(), QString("memory"));
}

// Windows Credential Manager / macOS Keychain really store the secret; on
// Linux a keyring may or may not exist, so either it works or the vault
// falls back to memory - and the token never reaches a file.
void TstSecretStore::platformBackend()
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

QTEST_MAIN(TstSecretStore)
#include "qtst_SecretStore.moc"
