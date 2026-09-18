#include "services/InstallPlanner.h"
#include "services/EntryRepository.h"

namespace Hypernucleus {

bool InstallPlanner::addGameSteps(const GameEntry& root,
                                  const RevisionInfo& rev,
                                  const QStringList& walkSpecs,
                                  InstallPlan& plan, QString* error) const
{
    const DownloadTarget target =
        BinarySelector::resolveTarget(rev, "game", m_os, m_arch);
    if (!target.ok) {
        *error = QStringLiteral("%1: %2").arg(root.title(), target.error);
        return false;
    }
    PlanStep game;
    game.name = m_game;
    game.version = rev.version;
    game.type = "game";
    game.target = target;
    plan.steps << game;

    QStringList specs = root.pipRequirements;
    for (const QString& s : walkSpecs)
        if (!specs.contains(s)) specs << s;
    plan.pipSpecs = specs;
    if (!specs.isEmpty() || !target.nativeBuild) {
        PlanStep pip;
        pip.kind = PlanStep::Kind::Pip;
        pip.name = m_game;
        pip.pipSpecs = specs;
        plan.steps << pip;
    }
    return true;
}

} // namespace Hypernucleus
