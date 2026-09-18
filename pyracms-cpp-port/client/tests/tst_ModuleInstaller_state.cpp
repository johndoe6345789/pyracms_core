#include "GtestModuleInstaller.h"

// --- Install State Persistence Tests ---

TEST_F(ModuleInstallerTest, InstalledStatePersistsAcrossInstances)
{
    {
        writeInstalled("test_module", "1.0.0");
    }

    ModuleInstaller* installer2 =
        new ModuleInstaller(m_apiClient, m_pathManager);
    EXPECT_TRUE(installer2->isInstalled("test_module"));
    EXPECT_EQ(installer2->installedVersion("test_module"), QString("1.0.0"));
    delete installer2;
}

TEST_F(ModuleInstallerTest, AlreadyInstalledSkipsDownload)
{
    {
        writeInstalled("existing_game", "1.0");
    }

    ModuleInstaller* installer2 =
        new ModuleInstaller(m_apiClient, m_pathManager);
    QSignalSpy completeSpy(installer2, &ModuleInstaller::installComplete);

    QJsonObject revisionData;
    revisionData["file_uuid"] = "some-uuid";
    installer2->install("existing_game", "1.0", revisionData, "game");

    ASSERT_EQ(completeSpy.count(), 1);
    EXPECT_EQ(completeSpy[0][0].toString(), QString("existing_game"));
    delete installer2;
}
