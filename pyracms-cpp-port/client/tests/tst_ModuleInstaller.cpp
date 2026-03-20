#include <gtest/gtest.h>
#include <gmock/gmock.h>

#include <QCoreApplication>
#include <QJsonArray>
#include <QJsonObject>
#include <QSettings>
#include <QSignalSpy>

#include "services/ApiClient.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

using namespace Hypernucleus;
using namespace testing;

class ModuleInstallerTest : public ::testing::Test {
protected:
    void SetUp() override {
        if (!QCoreApplication::instance()) {
            static int argc = 1;
            static char appName[] = "test";
            static char* argv[] = { appName, nullptr };
            m_app = new QCoreApplication(argc, argv);
            m_app->setOrganizationName("PyraCMS-Test");
            m_app->setApplicationName("Hypernucleus-InstallerTest");
        }

        QSettings settings;
        settings.remove("installed_modules");
        settings.sync();

        m_apiClient = new ApiClient();
        m_pathManager = new PathManager();
        m_installer = new ModuleInstaller(m_apiClient, m_pathManager);
    }

    void TearDown() override {
        delete m_installer;
        delete m_pathManager;
        delete m_apiClient;

        QSettings settings;
        settings.remove("installed_modules");
        settings.sync();
    }

    ApiClient* m_apiClient = nullptr;
    PathManager* m_pathManager = nullptr;
    ModuleInstaller* m_installer = nullptr;
    QCoreApplication* m_app = nullptr;
};

// --- Initial State Tests ---

TEST_F(ModuleInstallerTest, InitiallyNotBusy) {
    EXPECT_FALSE(m_installer->isBusy());
}

TEST_F(ModuleInstallerTest, InitiallyNothingInstalled) {
    EXPECT_FALSE(m_installer->isInstalled("nonexistent"));
    EXPECT_TRUE(m_installer->installedVersion("nonexistent").isEmpty());
}

TEST_F(ModuleInstallerTest, InstalledVersionsInitiallyEmpty) {
    EXPECT_TRUE(m_installer->installedVersions().isEmpty());
}

// --- Dependency Resolution Tests ---

TEST_F(ModuleInstallerTest, ResolveDependenciesEmpty) {
    QJsonArray emptyDeps;
    QJsonObject catalog;
    auto resolved = m_installer->resolveDependencies(emptyDeps, catalog);
    EXPECT_TRUE(resolved.isEmpty());
}

TEST_F(ModuleInstallerTest, ResolveSingleDependency) {
    QJsonArray deps;
    QJsonObject dep;
    dep["name"] = "pygame";
    dep["version"] = "2.0.0";
    deps.append(dep);

    QJsonObject catalog;
    QJsonObject depsSection;
    QJsonObject pygameEntry;
    pygameEntry["dependencies"] = QJsonArray();
    depsSection["pygame"] = pygameEntry;
    catalog["dependencies"] = depsSection;

    auto resolved = m_installer->resolveDependencies(deps, catalog);
    ASSERT_EQ(resolved.size(), 1);
    EXPECT_EQ(resolved[0].first, QString("pygame"));
    EXPECT_EQ(resolved[0].second, QString("2.0.0"));
}

TEST_F(ModuleInstallerTest, ResolveTransitiveDependencies) {
    QJsonArray gameDeps;
    QJsonObject libADep;
    libADep["name"] = "lib_a";
    libADep["version"] = "1.0";
    gameDeps.append(libADep);

    QJsonObject catalog;
    QJsonObject depsSection;

    QJsonObject libAEntry;
    QJsonArray libADeps;
    QJsonObject libBDep;
    libBDep["name"] = "lib_b";
    libBDep["version"] = "2.0";
    libADeps.append(libBDep);
    libAEntry["dependencies"] = libADeps;
    depsSection["lib_a"] = libAEntry;

    QJsonObject libBEntry;
    libBEntry["dependencies"] = QJsonArray();
    depsSection["lib_b"] = libBEntry;

    catalog["dependencies"] = depsSection;

    auto resolved = m_installer->resolveDependencies(gameDeps, catalog);
    ASSERT_EQ(resolved.size(), 2);
    // lib_b should come before lib_a (depth-first)
    EXPECT_EQ(resolved[0].first, QString("lib_b"));
    EXPECT_EQ(resolved[1].first, QString("lib_a"));
}

TEST_F(ModuleInstallerTest, ResolveCircularDependencies) {
    QJsonArray deps;
    QJsonObject libADep;
    libADep["name"] = "lib_a";
    libADep["version"] = "1.0";
    deps.append(libADep);

    QJsonObject catalog;
    QJsonObject depsSection;

    QJsonObject libAEntry;
    QJsonArray libADeps;
    QJsonObject libBRef;
    libBRef["name"] = "lib_b";
    libBRef["version"] = "2.0";
    libADeps.append(libBRef);
    libAEntry["dependencies"] = libADeps;
    depsSection["lib_a"] = libAEntry;

    QJsonObject libBEntry;
    QJsonArray libBDeps;
    QJsonObject libARef;
    libARef["name"] = "lib_a";
    libARef["version"] = "1.0";
    libBDeps.append(libARef);
    libBEntry["dependencies"] = libBDeps;
    depsSection["lib_b"] = libBEntry;

    catalog["dependencies"] = depsSection;

    auto resolved = m_installer->resolveDependencies(deps, catalog);
    ASSERT_EQ(resolved.size(), 2);
}

// --- Install Tracking Tests ---

TEST_F(ModuleInstallerTest, InstallFailsWithoutFileUuid) {
    QSignalSpy failSpy(m_installer, &ModuleInstaller::installFailed);

    QJsonObject revisionData;
    m_installer->install("test_game", "1.0", revisionData, "game");

    ASSERT_EQ(failSpy.count(), 1);
    EXPECT_EQ(failSpy[0][0].toString(), QString("test_game"));
    EXPECT_TRUE(failSpy[0][1].toString().contains("No file UUID"));
}

TEST_F(ModuleInstallerTest, UninstallFailsIfNotInstalled) {
    QSignalSpy failSpy(m_installer, &ModuleInstaller::uninstallFailed);

    m_installer->uninstall("nonexistent", "1.0", "game");

    ASSERT_EQ(failSpy.count(), 1);
    EXPECT_TRUE(failSpy[0][1].toString().contains("not installed"));
}

// --- Install State Persistence Tests ---

TEST_F(ModuleInstallerTest, InstalledStatePersistsAcrossInstances) {
    {
        QSettings settings;
        settings.beginGroup("installed_modules");
        settings.setValue("test_module", "1.0.0");
        settings.endGroup();
        settings.sync();
    }

    ModuleInstaller* installer2 = new ModuleInstaller(m_apiClient, m_pathManager);
    EXPECT_TRUE(installer2->isInstalled("test_module"));
    EXPECT_EQ(installer2->installedVersion("test_module"), QString("1.0.0"));
    delete installer2;
}

TEST_F(ModuleInstallerTest, AlreadyInstalledSkipsDownload) {
    {
        QSettings settings;
        settings.beginGroup("installed_modules");
        settings.setValue("existing_game", "1.0");
        settings.endGroup();
        settings.sync();
    }

    ModuleInstaller* installer2 = new ModuleInstaller(m_apiClient, m_pathManager);
    QSignalSpy completeSpy(installer2, &ModuleInstaller::installComplete);

    QJsonObject revisionData;
    revisionData["file_uuid"] = "some-uuid";
    installer2->install("existing_game", "1.0", revisionData, "game");

    ASSERT_EQ(completeSpy.count(), 1);
    EXPECT_EQ(completeSpy[0][0].toString(), QString("existing_game"));
    delete installer2;
}
