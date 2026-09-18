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
    void settingsEditingIsBufferedUntilSave();
    void invalidServerUrlBlocksSave();
};

void TstUiDeepLinkAndSettings::settingsEditingIsBufferedUntilSave()
{
    TestEnv env;
    SettingsManager sm;
    ApiClient api;
    SettingsViewModel vm(&sm, &api);
    QSignalSpy saved(&vm, &SettingsViewModel::saved);
    vm.setTenantSlug("acme");
    vm.setInstallDir("/games");
    vm.setPythonPath("/usr/bin/python3");
    vm.setPreferPip(false);
    vm.setChunkSize(4096);
    vm.setOsName("windows");
    vm.setArchName("arm64");
    QVERIFY(vm.isDirty());
    QCOMPARE(sm.tenantSlug(), QString()); // not applied yet
    vm.save();
    QCOMPARE(saved.count(), 1);
    QVERIFY(!vm.isDirty());
    QCOMPARE(sm.tenantSlug(), QString("acme"));
    QCOMPARE(sm.installDir(), QString("/games"));
    QVERIFY(!sm.preferPip());
    QCOMPARE(sm.osName(), QString("windows"));
    QCOMPARE(SettingsManager().tenantSlug(), QString("acme")); // on disk
    vm.fetchOsArchLists();
    QVERIFY(vm.osList().contains("linux"));
    QVERIFY(vm.archList().contains("x86_64"));
}

void TstUiDeepLinkAndSettings::invalidServerUrlBlocksSave()
{
    TestEnv env;
    SettingsManager sm;
    ApiClient api;
    SettingsViewModel vm(&sm, &api);
    vm.setRepoUrl("ftp://nope");
    QVERIFY(!vm.urlError().isEmpty());
    vm.save();
    QVERIFY(sm.repoUrl() != "ftp://nope");
    vm.setRepoUrl("https://ok.example");
    QVERIFY(vm.urlError().isEmpty());
    vm.save();
    QCOMPARE(sm.repoUrl(), QString("https://ok.example"));
}

QTEST_MAIN(TstUiDeepLinkAndSettings)
#include "qtst_UiDeepLinkAndSettings_2.moc"
