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
    void cancelAndResetDefaults();
};

void TstUiDeepLinkAndSettings::cancelAndResetDefaults()
{
    TestEnv env;
    SettingsManager sm;
    ApiClient api;
    SettingsViewModel vm(&sm, &api);
    QSignalSpy cancelled(&vm, &SettingsViewModel::cancelled);
    vm.setTenantSlug("temp");
    vm.cancel();
    QCOMPARE(cancelled.count(), 1);
    QCOMPARE(vm.tenantSlug(), QString());
    QVERIFY(!vm.isDirty());
    sm.setTenantSlug("changed");
    QCOMPARE(vm.tenantSlug(), QString("changed")); // follows when clean
    vm.resetDefaults();
    QCOMPARE(sm.tenantSlug(), QString());
    QVERIFY(sm.darkMode()); // dark theme is the default
}

QTEST_MAIN(TstUiDeepLinkAndSettings)
#include "qtst_UiDeepLinkAndSettings_3.moc"
