#include <QtTest>

#include "HungStore.h"
#include "services/SecretStore.h"
#include "services/TimedSecretStore.h"
#include "services/TokenVault.h"

using namespace Hypernucleus;

class TstTimedSecretStore : public QObject {
    Q_OBJECT

private slots:
    void passesThroughWhenFast();
    void hungKeychainTimesOutAndFallsBack();
};

void TstTimedSecretStore::passesThroughWhenFast()
{
    TimedSecretStore s(std::make_shared<MemorySecretStore>(), 2000);
    QVERIFY(s.isAvailable());
    QCOMPARE(s.backendName(), QString("memory"));
    QVERIFY(s.write("svc", "acc", "v"));
    QCOMPARE(s.read("svc", "acc"), QString("v"));
    QVERIFY(s.remove("svc", "acc"));
    QCOMPARE(s.read("svc", "acc"), QString());
}

void TstTimedSecretStore::hungKeychainTimesOutAndFallsBack()
{
    auto gate = std::make_shared<Gate>();
    auto timed = std::make_unique<TimedSecretStore>(
        std::make_shared<HungStore>(gate), 300);
    TimedSecretStore* raw = timed.get();
    TokenVault vault(std::move(timed));

    QElapsedTimer t;
    t.start();
    QVERIFY(!vault.save("tok")); // keychain never answers: session only
    QVERIFY(t.elapsed() < 5000);
    QVERIFY(vault.sessionOnly());
    QVERIFY(!raw->isAvailable()); // later calls fail at once
    t.restart();
    QCOMPARE(vault.load(), QString("tok")); // from the memory fallback
    QVERIFY(!raw->remove("a", "b"));
    QCOMPARE(raw->read("a", "b"), QString());
    QVERIFY(t.elapsed() < 1000);
    gate->release(); // let the abandoned worker threads finish
}

QTEST_MAIN(TstTimedSecretStore)
#include "qtst_TimedSecretStore.moc"
