#include <QtTest>
#include <QRandomGenerator>
#include <thread>

#include "services/SingleInstance.h"

using namespace Hypernucleus;

static QString uniqueKey()
{
    return "hn-test-" + QString::number(QCoreApplication::applicationPid()) +
           "-" + QString::number(QRandomGenerator::global()->generate());
}

class TstSingleInstance : public QObject {
    Q_OBJECT

private slots:
    void nobodyListeningMeansPrimary();
    void secondInstanceForwardsMessage();
    void oversizedMessageIsTruncated();
    void keyIsPerUser();
};

void TstSingleInstance::nobodyListeningMeansPrimary()
{
    SingleInstance a(uniqueKey());
    QVERIFY(!a.sendToPrimary("x", 200));
    QVERIFY(!a.isPrimary());
    QVERIFY(a.listenAsPrimary());
    QVERIFY(a.isPrimary());
}

void TstSingleInstance::secondInstanceForwardsMessage()
{
    const QString key = uniqueKey();
    SingleInstance primary(key);
    QVERIFY(primary.listenAsPrimary());
    QSignalSpy got(&primary, &SingleInstance::messageReceived);

    SingleInstance second(key);
    QTimer::singleShot(0, [&]() {
        second.sendToPrimary("pyracms://launch/acme/tetris", 3000);
    });
    QTRY_COMPARE_WITH_TIMEOUT(got.count(), 1, 5000);
    QCOMPARE(got.at(0).at(0).toString(),
             QString("pyracms://launch/acme/tetris"));
}

void TstSingleInstance::oversizedMessageIsTruncated()
{
    const QString key = uniqueKey();
    SingleInstance primary(key);
    QVERIFY(primary.listenAsPrimary());
    QSignalSpy got(&primary, &SingleInstance::messageReceived);
    SingleInstance second(key);
    // Own thread: macOS/Windows socket buffers are small, so a blocking
    // sender must not share the thread that drains the primary.
    std::thread sender(
        [&]() { second.sendToPrimary(QString(20000, 'x'), 3000); });
    QTRY_COMPARE_WITH_TIMEOUT(got.count(), 1, 5000);
    sender.join();
    QCOMPARE(got.at(0).at(0).toString().size(),
             SingleInstance::kMaxMessageBytes);
}

void TstSingleInstance::keyIsPerUser()
{
    QVERIFY(SingleInstance::defaultKey().startsWith("pyracms-hypernucleus-"));
}

QTEST_MAIN(TstSingleInstance)
#include "qtst_SingleInstance.moc"
