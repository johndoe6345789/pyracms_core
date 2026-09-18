#include "GtestModuleInstaller.h"

// --- Dependency Resolution Tests ---

TEST_F(ModuleInstallerTest, ResolveDependenciesEmpty)
{
    QJsonArray emptyDeps;
    QJsonObject catalog;
    auto resolved = m_installer->resolveDependencies(emptyDeps, catalog);
    EXPECT_TRUE(resolved.isEmpty());
}

TEST_F(ModuleInstallerTest, ResolveSingleDependency)
{
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

TEST_F(ModuleInstallerTest, ResolveTransitiveDependencies)
{
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
