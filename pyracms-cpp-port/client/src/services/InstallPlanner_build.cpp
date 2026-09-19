#include "services/InstallPlanner.h"
#include "services/EntryRepository.h"
#include "services/PlanWalk.h"

namespace Hypernucleus {

InstallPlan InstallPlanner::build(QString* error) const
{
    InstallPlan plan;
    const GameEntry* root = m_repo->find(m_game, "game");

    Walk walk;
    QSet<QString> seen;
    walkDeps(root->dependencies, *m_repo, m_isPip, seen, walk);

    const QString version =
        m_version.isEmpty() ? root->latestVersion() : m_version;
    const RevisionInfo* rev = root->revision(version);
    if (version.isEmpty() || !rev || !rev->published) {
        *error = version.isEmpty()
                     ? tr("%1 has no published version")
                           .arg(root->title())
                     : tr("Version %1 of %2 is not available")
                           .arg(version, root->title());
        return plan;
    }
    for (const DepRef& dep : orderedModules()) {
        if (!addDepStep(dep, plan, error)) return plan;
    }
    if (!addGameSteps(*root, *rev, walk.pipSpecs, plan, error)) return plan;

    plan.rootName = m_game;
    plan.rootVersion = rev->version;
    return plan;
}

} // namespace Hypernucleus
