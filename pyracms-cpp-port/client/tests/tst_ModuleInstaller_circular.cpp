#include "GtestModuleInstaller.h"

TEST_F(ModuleInstallerTest, ResolveCircularDependencies)
{
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
