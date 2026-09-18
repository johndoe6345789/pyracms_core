#include "GtestSettingsManager.h"

// --- Default Values Tests ---

TEST_F(SettingsManagerTest, DefaultRepoUrl) {
    EXPECT_EQ(m_manager->repoUrl(), QString("http://localhost:8080"));
}

TEST_F(SettingsManagerTest, DefaultChunkSize) {
    EXPECT_EQ(m_manager->chunkSize(), 8192);
}

TEST_F(SettingsManagerTest, DefaultOsIsDetected) {
    QString os = m_manager->osName();
    EXPECT_FALSE(os.isEmpty());
}

TEST_F(SettingsManagerTest, DefaultArchIsDetected) {
    QString arch = m_manager->archName();
    EXPECT_FALSE(arch.isEmpty());
}

TEST_F(SettingsManagerTest, DefaultWindowGeometry) {
    QRect geom = m_manager->windowGeometry();
    EXPECT_EQ(geom.x(), 100);
    EXPECT_EQ(geom.y(), 100);
    EXPECT_EQ(geom.width(), 1280);
    EXPECT_EQ(geom.height(), 800);
}

// --- Static Detection Tests ---

TEST_F(SettingsManagerTest, DetectOsReturnsNonEmpty) {
    EXPECT_FALSE(SettingsManager::detectOs().isEmpty());
}

TEST_F(SettingsManagerTest, DetectArchReturnsNonEmpty) {
    EXPECT_FALSE(SettingsManager::detectArch().isEmpty());
}
