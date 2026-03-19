#include <gtest/gtest.h>
#include <gmock/gmock.h>

#include <QCoreApplication>
#include <QSettings>
#include <QSignalSpy>

#include "services/SettingsManager.h"

using namespace Hypernucleus;
using namespace testing;

class SettingsManagerTest : public ::testing::Test {
protected:
    void SetUp() override {
        if (!QCoreApplication::instance()) {
            static int argc = 1;
            static char appName[] = "test";
            static char* argv[] = { appName, nullptr };
            m_app = new QCoreApplication(argc, argv);
            m_app->setOrganizationName("PyraCMS-Test");
            m_app->setApplicationName("Hypernucleus-Test");
        }

        // Clear any existing test settings
        QSettings settings;
        settings.clear();
        settings.sync();

        m_manager = new SettingsManager();
    }

    void TearDown() override {
        delete m_manager;

        // Clean up test settings
        QSettings settings;
        settings.clear();
        settings.sync();
    }

    SettingsManager* m_manager = nullptr;
    QCoreApplication* m_app = nullptr;
};

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
    m_manager->setOsName("windows");
    EXPECT_EQ(m_manager->osName(), QString("windows"));
    EXPECT_EQ(spy.count(), 1);
}

TEST_F(SettingsManagerTest, SetArchName) {
    QSignalSpy spy(m_manager, &SettingsManager::archNameChanged);
    m_manager->setArchName("arm64");
    EXPECT_EQ(m_manager->archName(), QString("arm64"));
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

// --- Static Detection Tests ---

TEST_F(SettingsManagerTest, DetectOsReturnsNonEmpty) {
    EXPECT_FALSE(SettingsManager::detectOs().isEmpty());
}

TEST_F(SettingsManagerTest, DetectArchReturnsNonEmpty) {
    EXPECT_FALSE(SettingsManager::detectArch().isEmpty());
}
