#include "services/PlanWalk.h"
#include "services/EntryRepository.h"

namespace Hypernucleus {

QString pipSpecFor(const DepRef& d)
{
    if (d.source == "pip" && !d.version.isEmpty())
        return d.name + "==" + d.version;
    return d.name;
}

bool isPipDep(const DepRef& d, const QMap<QString, bool>& resolved, bool* known)
{
    *known = true;
    if (d.source == "pip") return true;
    if (d.source == "pyracms") return false;
    const auto it = resolved.constFind(d.name);
    if (it == resolved.constEnd()) {
        *known = false;
        return false;
    }
    return it.value();
}

void walkDeps(const QList<DepRef>& deps, const EntryRepository& repo,
              const QMap<QString, bool>& resolved, QSet<QString>& seen,
              Walk& out)
{
    for (const DepRef& d : deps) {
        if (seen.contains(d.name)) continue;
        seen.insert(d.name);
        bool known = true;
        const bool pip = isPipDep(d, resolved, &known);
        if (!known) {
            out.unknown << d.name;
            continue;
        }
        if (pip) {
            const QString spec = pipSpecFor(d);
            if (!out.pipSpecs.contains(spec)) out.pipSpecs << spec;
            continue;
        }
        const GameEntry* e = repo.find(d.name, "dep");
        if (!e) {
            out.missing << d.name;
            continue;
        }
        out.moduleNames << d.name;
        if (!e->detailLoaded) {
            out.needDetail << d.name;
            continue;
        }
        for (const QString& s : e->pipRequirements)
            if (!out.pipSpecs.contains(s)) out.pipSpecs << s;
        walkDeps(e->dependencies, repo, resolved, seen, out);
    }
}

} // namespace Hypernucleus
