#pragma once

#include "MiniHttp.h"
#include "TestEnv.h"
#include "ZipBuilder.h"
#include "services/SettingsManager.h"
#include "viewmodels/MainViewModel.h"

// MainViewModel talking to a MiniHttp "PyraCMS" with two games.
struct AppFixture {
    AppFixture()
    {
        addGame(
            "tetris", "1.0",
            {{"tetris/__init__.py", "def main():\n    print('tetris-ran')\n"}});
        addGame("racer", "0.5", {{"racer/__init__.py", "def main(): pass"}});
        http.routes["/api/outputs/json"] = catalog();
        Hypernucleus::SettingsManager s;
        s.setRepoUrl(http.baseUrl());
        s.setTenantSlug("acme");
        s.setOsName("linux");
        s.setArchName("x86_64");
        s.setPreferPip(false);
        s.save();
        vm = new Hypernucleus::MainViewModel(nullptr);
    }
    ~AppFixture() { delete vm; }

    void addGame(const QString& name, const QString& version,
                 const QMap<QString, QByteArray>& files)
    {
        const QString zip = env.path(name + ".zip");
        buildZip(zip, files);
        http.routes["/api/files/" + name] = readAll(zip);
        http.routes["/api/gamedep/game/" + name] =
            QString(
                R"({"name":"%1","displayName":"%1","tags":["t"],
                "dependencies":[],"revisions":[{"version":"%2",
                "fileId":"%1","published":true}]})")
                .arg(name, version)
                .toUtf8();
        names << name;
        versions << version;
    }

    QByteArray catalog() const
    {
        QStringList rows;
        for (int i = 0; i < names.size(); ++i)
            rows << QString(R"({"name":"%1","displayName":"%1","revisions":
                [{"version":"%2","fileId":"%1","published":true}]})")
                        .arg(names[i], versions[i]);
        return ("{\"games\":[" + rows.join(",") + "],\"deps\":[]}").toUtf8();
    }

    TestEnv env;
    MiniHttp http;
    QStringList names, versions;
    Hypernucleus::MainViewModel* vm = nullptr;
};
