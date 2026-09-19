#include <QtTest>

#include "SecretFakes.h"
#include "TestEnv.h"
#include "services/SecretStore.h"
#include "services/TokenVault.h"

using namespace Hypernucleus;

class TstSecretStore : public QObject {
    Q_OBJECT

private slots:
    void memoryStoreRoundTrip();
    void vaultUsesTheKeychainWhenItWorks();
    void vaultFallsBackToSessionMemory();
    void migratesPlaintextTokenAndDeletesIt();
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

QTEST_MAIN(TstSecretStore)
#include "qtst_SecretStore.moc"
