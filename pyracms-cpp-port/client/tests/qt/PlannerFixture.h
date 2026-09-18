#pragma once

#include <QTemporaryDir>

#include "Fixtures.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"
#include "services/InstallPlanner.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"
#include "services/PipResolver.h"

// Everything a planner needs, wired to a temporary data folder.
struct PlannerFixture {
    using Plan = Hypernucleus::InstallPlan;

    PlannerFixture()
        : paths(dir.path()), inst(&api, &paths), repo(&api),
          planner(&repo, &inst, &pip)
    {
        qRegisterMetaType<Plan>();
        planner.setPlatform("linux", "x86_64");
        planner.setPreferPip(false);
    }

    void seed(const QList<Hypernucleus::GameEntry>& e) { repo.setEntries(e); }

    QTemporaryDir dir;
    Hypernucleus::ApiClient api;
    Hypernucleus::PathManager paths;
    Hypernucleus::ModuleInstaller inst;
    Hypernucleus::EntryRepository repo;
    Hypernucleus::PipResolver pip;
    Hypernucleus::InstallPlanner planner;
};
