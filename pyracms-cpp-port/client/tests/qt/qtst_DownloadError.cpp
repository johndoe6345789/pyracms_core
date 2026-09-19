#include <QtTest>

#include "domain/DownloadError.h"

using namespace Hypernucleus;

class TstDownloadError : public QObject {
    Q_OBJECT

private slots:
    void anonymousPrivateContentAsksForSignIn_data();
    void anonymousPrivateContentAsksForSignIn();
    void signedInUserIsToldThereIsNoAccess();
    void otherFailuresKeepStatusAndText();
};

void TstDownloadError::anonymousPrivateContentAsksForSignIn_data()
{
    QTest::addColumn<int>("status");
    QTest::newRow("401") << 401;
    QTest::newRow("403") << 403;
}

void TstDownloadError::anonymousPrivateContentAsksForSignIn()
{
    QFETCH(int, status);
    const QString msg = DownloadError::describe(status, "Forbidden", false);
    QCOMPARE(msg, QString("This game is private - sign in to install."));
}

void TstDownloadError::signedInUserIsToldThereIsNoAccess()
{
    const QString msg = DownloadError::describe(403, "Forbidden", true);
    QVERIFY(msg.contains("do not have access"));
    QVERIFY(!msg.contains("sign in"));
}

void TstDownloadError::otherFailuresKeepStatusAndText()
{
    QCOMPARE(DownloadError::describe(500, "boom", false),
             QString("HTTP 500: boom"));
    QCOMPARE(DownloadError::describe(0, "Connection refused", true),
             QString("Connection refused"));
}

QTEST_APPLESS_MAIN(TstDownloadError)
#include "qtst_DownloadError.moc"
