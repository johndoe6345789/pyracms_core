#include "GtestSettingsManager.h"

// --- Persistence Tests ---

TEST_F(SettingsManagerTest, SaveAndLoad) {
    m_manager->setRepoUrl("https://saved-url.com");
    m_manager->setOsName("linux");
    m_manager->setArchName("x86_64");
    m_manager->setChunkSize(32768);
    m_manager->save();

    SettingsManager* manager2 = new SettingsManager();
    EXPECT_EQ(manager2->repoUrl(), QString("https://saved-url.com"));
    EXPECT_EQ(manager2->osName(), QString("linux"));
    EXPECT_EQ(manager2->archName(), QString("x86_64"));
    EXPECT_EQ(manager2->chunkSize(), 32768);
    delete manager2;
}

TEST_F(SettingsManagerTest, Reset) {
    m_manager->setRepoUrl("https://custom-url.com");
    m_manager->setChunkSize(65536);
    m_manager->save();

    m_manager->reset();

    EXPECT_EQ(m_manager->repoUrl(), QString("http://localhost:8080"));
    EXPECT_EQ(m_manager->chunkSize(), 8192);
}
