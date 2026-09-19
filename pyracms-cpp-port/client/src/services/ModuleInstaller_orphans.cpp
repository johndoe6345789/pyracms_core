#include "services/ModuleInstaller.h"

namespace Hypernucleus {

// Reference counting: a dependency module is needed by every installed
// module that lists it in InstallRecord::deps (the planner records the full
// transitive set for each game).
QStringList ModuleInstaller::orphansOf(const InstallRecord& gone) const
{
    QStringList orphans;
    for (const QString& dep : gone.deps) {
        if (!m_store.contains(dep) || dep == gone.name) continue;
        bool needed = false;
        for (const QString& other : m_store.names()) {
            if (other == dep || other == gone.name) continue;
            if (m_store.get(other).deps.contains(dep)) needed = true;
        }
        if (!needed) orphans << dep;
    }
    return orphans;
}

void ModuleInstaller::removeOrphans(const InstallRecord& gone)
{
    for (const QString& dep : orphansOf(gone)) {
        const InstallRecord rec = m_store.get(dep);
        if (rec.type != "dep") continue;
        if (!rec.path.isEmpty() && !removeDirectory(rec.path)) continue;
        m_store.remove(dep);
        emit orphanRemoved(dep);
    }
    saveState();
}

} // namespace Hypernucleus
