#include "GtestSettingsManager.h"

// --- Set/Get Tests ---

TEST_F(SettingsManagerTest, SetRepoUrl) {
    m_manager->setRepoUrl("https://example.com:9090");
    EXPECT_EQ(m_manager->repoUrl(), QString("https://example.com:9090"));
}

TEST_F(SettingsManagerTest, SetRepoUrlEmitsSignal) {
    QSignalSpy spy(m_manager, &SettingsManager::repoUrlChanged);
    m_manager->setRepoUrl("https://newurl.com");
    EXPECT_EQ(spy.count(), 1);
}

TEST_F(SettingsManagerTest, SetSameRepoUrlDoesNotEmit) {
    m_manager->setRepoUrl("http://localhost:8080");
    QSignalSpy spy(m_manager, &SettingsManager::repoUrlChanged);
    m_manager->setRepoUrl("http://localhost:8080");
    EXPECT_EQ(spy.count(), 0);
}

TEST_F(SettingsManagerTest, SetOsName) {
    QSignalSpy spy(m_manager, &SettingsManager::osNameChanged);
    m_manager->setOsName("haiku");
    EXPECT_EQ(m_manager->osName(), QString("haiku"));
    EXPECT_EQ(spy.count(), 1);
}

TEST_F(SettingsManagerTest, SetArchName) {
    QSignalSpy spy(m_manager, &SettingsManager::archNameChanged);
    m_manager->setArchName("riscv64");
    EXPECT_EQ(m_manager->archName(), QString("riscv64"));
    EXPECT_EQ(spy.count(), 1);
}

TEST_F(SettingsManagerTest, ChunkSizeClampedToMinimum) {
    m_manager->setChunkSize(100);
    EXPECT_EQ(m_manager->chunkSize(), 1024);
}

TEST_F(SettingsManagerTest, ChunkSizeClampedToMaximum) {
    m_manager->setChunkSize(99999999);
    EXPECT_EQ(m_manager->chunkSize(), 1048576);
}
