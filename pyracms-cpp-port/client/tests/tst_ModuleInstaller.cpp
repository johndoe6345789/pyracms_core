#include "GtestModuleInstaller.h"

// --- Initial State Tests ---

TEST_F(ModuleInstallerTest, InitiallyNotBusy)
{
    EXPECT_FALSE(m_installer->isBusy());
}

TEST_F(ModuleInstallerTest, InitiallyNothingInstalled)
{
    EXPECT_FALSE(m_installer->isInstalled("nonexistent"));
    EXPECT_TRUE(m_installer->installedVersion("nonexistent").isEmpty());
}

TEST_F(ModuleInstallerTest, InstalledVersionsInitiallyEmpty)
{
    EXPECT_TRUE(m_installer->installedVersions().isEmpty());
}

// --- Install Tracking Tests ---

TEST_F(ModuleInstallerTest, InstallFailsWithoutFileUuid)
{
    QSignalSpy failSpy(m_installer, &ModuleInstaller::installFailed);

    QJsonObject revisionData;
    m_installer->install("test_game", "1.0", revisionData, "game");

    ASSERT_EQ(failSpy.count(), 1);
    EXPECT_EQ(failSpy[0][0].toString(), QString("test_game"));
    EXPECT_TRUE(failSpy[0][1].toString().contains("No file UUID"));
}

TEST_F(ModuleInstallerTest, UninstallFailsIfNotInstalled)
{
    QSignalSpy failSpy(m_installer, &ModuleInstaller::uninstallFailed);

    m_installer->uninstall("nonexistent", "1.0", "game");

    ASSERT_EQ(failSpy.count(), 1);
    EXPECT_TRUE(failSpy[0][1].toString().contains("not installed"));
}
