#pragma once

#include "Fixtures.h"
#include "TestEnv.h"
#include "models/Constants.h"
#include "models/GameDepModel.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

// A GameDepModel over a seeded repository. `installed` (name -> version)
// is written to installed.json before the installer reads it.
struct ModelFixture {
    explicit ModelFixture(const QMap<QString, QString>& installed = {})
        : paths(env.path("data")), seeded(seedState(paths, installed)),
          repo(&api), inst(&api, &paths)
    {
        auto tetris =
            entry("tetris", "game", {rev("1.0", "a"), rev("1.2", "b")});
        tetris.tags = {"puzzle", "classic"};
        tetris.description = "Falling blocks";
        auto racer = entry("racer", "game", {rev("0.5", "c")});
        racer.tags = {"arcade"};
        racer.hero = "hero-ref";
        repo.setEntries({tetris, racer, entry("lib", "dep", {})});
        model.attach(&repo, &inst, &api);
    }

    static bool seedState(Hypernucleus::PathManager& paths,
                          const QMap<QString, QString>& installed)
    {
        Hypernucleus::InstallStateStore store(paths.stateFile());
        for (auto it = installed.cbegin(); it != installed.cend(); ++it) {
            Hypernucleus::InstallRecord r;
            r.name = it.key();
            r.version = it.value();
            r.type = "game";
            r.path = paths.gameDir(it.key());
            store.set(r);
        }
        return store.save();
    }

    TestEnv env;
    Hypernucleus::ApiClient api;
    Hypernucleus::PathManager paths;
    bool seeded;
    Hypernucleus::EntryRepository repo;
    Hypernucleus::ModuleInstaller inst;
    Hypernucleus::GameDepModel model;
};
