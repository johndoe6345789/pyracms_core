#include "services/InstallPlanner.h"
#include "services/EntryRepository.h"
#include "services/ModuleInstaller.h"
#include "services/PipResolver.h"
#include "domain/DependencyResolver.h"
#include "services/PlanWalk.h"

namespace Hypernucleus {

void InstallPlanner::advance()
{
    if (!m_active) return;
    const GameEntry* root = m_repo->find(m_game, "game");
    if (!root) {
        fail(QStringLiteral("Unknown game '%1'").arg(m_game));
        return;
    }
    if (!root->detailLoaded && !m_requested.contains("root-failed")) {
        if (!m_requested.contains("root")) {
            m_requested.insert("root");
            m_repo->ensureDetail("game", m_game);
        }
        return;
    }

    Walk walk;
    QSet<QString> seen;
    walkDeps(root->dependencies, *m_repo, m_isPip, seen, walk);

    if (!walk.unknown.isEmpty()) {
        if (!m_preferPip) {
            for (const QString& n : walk.unknown)
                m_isPip.insert(n, false);
            advance();
            return;
        }
        if (m_pipCheckRunning) return;
        m_pipCheckRunning = true;
        const int gen = m_generation;
        m_pip->check(
            walk.unknown, [this, gen](const QMap<QString, bool>& result) {
                if (gen != m_generation || !m_active) return;
                m_pipCheckRunning = false;
                for (auto it = result.cbegin(); it != result.cend(); ++it)
                    m_isPip.insert(it.key(), it.value());
                advance();
            });
        return;
    }

    if (!walk.missing.isEmpty()) {
        fail(tr("Dependency '%1' is neither on pip nor on this PyraCMS "
                "site")
                 .arg(walk.missing.first()));
        return;
    }

    bool waiting = false;
    for (const QString& n : walk.needDetail) {
        waiting = true;
        if (!m_requested.contains("dep/" + n)) {
            m_requested.insert("dep/" + n);
            m_repo->ensureDetail("dep", n);
        }
    }
    if (waiting) return;

    QString error;
    const InstallPlan plan = build(&error);
    if (!error.isEmpty()) {
        fail(error);
        return;
    }
    m_active = false;
    emit planReady(plan);
}

} // namespace Hypernucleus
