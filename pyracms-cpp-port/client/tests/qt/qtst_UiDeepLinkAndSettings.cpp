#include <QtTest>

#include "TestEnv.h"
#include "services/ApiClient.h"
#include "services/SettingsManager.h"
#include "viewmodels/DeepLinkController.h"
#include "viewmodels/SettingsViewModel.h"

using namespace Hypernucleus;

class TstUiDeepLinkAndSettings : public QObject {
    Q_OBJECT

private slots:
    void storesValidLinkUntilAnswered();
    void rejectsBadLinks();
    void flagsSiteMismatch();
};

void TstUiDeepLinkAndSettings::storesValidLinkUntilAnswered()
{
    DeepLinkController c;
    QSignalSpy pend(&c, &DeepLinkController::pendingChanged);
    QSignalSpy acc(&c, &DeepLinkController::accepted);
    QVERIFY(c.setUrl("pyracms://install/acme/tetris", "acme"));
    QVERIFY(c.pending());
    QCOMPARE(c.action(), QString("install"));
    QCOMPARE(c.slug(), QString("acme"));
    QCOMPARE(c.name(), QString("tetris"));
    QVERIFY(!c.siteMismatch());
    c.accept();
    QVERIFY(!c.pending());
    QCOMPARE(acc.count(), 1);
    QCOMPARE(acc.at(0).at(2).toString(), QString("tetris"));
    QVERIFY(pend.count() >= 2);
    c.accept(); // nothing pending
    QCOMPARE(acc.count(), 1);
}

void TstUiDeepLinkAndSettings::rejectsBadLinks()
{
    DeepLinkController c;
    QSignalSpy bad(&c, &DeepLinkController::rejected);
    QVERIFY(!c.setUrl("pyracms://launch/acme/..", "acme"));
    QCOMPARE(bad.count(), 1);
    QVERIFY(!c.pending());
    QVERIFY(c.setUrl("pyracms://launch/acme/x", ""));
    c.dismiss();
    QVERIFY(!c.pending());
}

void TstUiDeepLinkAndSettings::flagsSiteMismatch()
{
    DeepLinkController c;
    QVERIFY(c.setUrl("pyracms://launch/other/x", "acme"));
    QVERIFY(c.siteMismatch());
    QVERIFY(c.setUrl("pyracms://launch/other/x", "")); // no site yet
    QVERIFY(!c.siteMismatch());
    QCOMPARE(c.link().slug, QString("other"));
}

QTEST_MAIN(TstUiDeepLinkAndSettings)
#include "qtst_UiDeepLinkAndSettings.moc"
