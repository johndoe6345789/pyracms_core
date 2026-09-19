#include "services/InstallPlanner.h"
#include "services/EntryRepository.h"
#include "services/ModuleInstaller.h"
#include "services/PlanWalk.h"
#include "domain/DependencyResolver.h"
#include "domain/VersionCompare.h"

namespace Hypernucleus {

// PyraCMS dependency modules in install order (dependencies first).
QList<DepRef> InstallPlanner::orderedModules() const
{
    const GameEntry* root = m_repo->find(m_game, "game");
    const auto modulesOf = [this](const QList<DepRef>& deps) {
        QList<DepRef> out;
        for (const DepRef& d : deps) {
            bool known = true;
            if (!isPipDep(d, m_isPip, &known)) out << d;
        }
        return out;
    };
    const auto lookup = [&](const QString& name) {
        return modulesOf(depsOf(name));
    };
    QStringList cycles;
    return DependencyResolver::resolveOrder(modulesOf(root->dependencies),
                                            lookup, &cycles);
}

bool InstallPlanner::addDepStep(const DepRef& dep, InstallPlan& plan,
                                QString* error) const
{
    const GameEntry* entry = m_repo->find(dep.name, "dep");
    if (!entry) {
        *error =
            tr("Dependency '%1' is not available").arg(dep.name);
        return false;
    }
    const QString want =
        dep.version.isEmpty() ? entry->latestVersion() : dep.version;
    const RevisionInfo* rev = entry->revision(want);
    if (want.isEmpty() || !rev || !rev->published) {
        *error = tr("Dependency %1 version %2 is not published")
                     .arg(entry->title(),
                          want.isEmpty() ? tr("(any)") : want);
        return false;
    }
    const DownloadTarget target =
        BinarySelector::resolveTarget(*rev, "dep", m_os, m_arch);
    if (!target.ok) {
        *error = tr("Dependency %1: %2")
                     .arg(entry->title(), target.error);
        return false;
    }
    plan.depNames << dep.name;

    const QString have = m_installer->installedVersion(dep.name);
    if (!have.isEmpty() && VersionCompare::compare(have, rev->version) == 0)
        return true; // already installed in the right version
    PlanStep step;
    step.name = dep.name;
    step.version = rev->version;
    step.type = "dep";
    step.target = target;
    plan.steps << step;
    return true;
}

} // namespace Hypernucleus
