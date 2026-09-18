#include "services/InstallPlanner.h"
#include "services/EntryRepository.h"
#include "services/ModuleInstaller.h"
#include "services/PipResolver.h"
#include "domain/DependencyResolver.h"
#include "domain/VersionCompare.h"

namespace Hypernucleus {

namespace {

struct Walk {
    QStringList unknown;       // not yet classified as pip / PyraCMS
    QStringList needDetail;    // PyraCMS deps whose page is not loaded yet
    QStringList missing;       // neither on pip nor known to PyraCMS
    QStringList pipSpecs;      // collected pip requirements
    QStringList moduleNames;   // reachable PyraCMS dependency modules
};

QString pipSpecFor(const DepRef& d)
{
    if (d.source == "pip" && !d.version.isEmpty())
        return d.name + "==" + d.version;
    return d.name;
}

} // namespace

InstallPlanner::InstallPlanner(EntryRepository* repo, ModuleInstaller* installer,
                               PipResolver* pip, QObject* parent)
    : QObject(parent)
    , m_repo(repo)
    , m_installer(installer)
    , m_pip(pip)
{
    connect(m_repo, &EntryRepository::entryChanged,
            this, &InstallPlanner::onEntryChanged);
    connect(m_repo, &EntryRepository::detailFailed,
            this, &InstallPlanner::onDetailFailed);
}

void InstallPlanner::setPlatform(const QString& os, const QString& arch)
{
    m_os = os;
    m_arch = arch;
}

void InstallPlanner::abort()
{
    m_active = false;
    ++m_generation;
    m_pipCheckRunning = false;
}

void InstallPlanner::plan(const QString& gameName, const QString& version)
{
    ++m_generation;
    m_active = true;
    m_pipCheckRunning = false;
    m_game = gameName;
    m_version = version;
    m_isPip.clear();
    m_requested.clear();
    advance();
}

void InstallPlanner::fail(const QString& error)
{
    const QString game = m_game;
    abort();
    emit planFailed(game, error);
}

void InstallPlanner::onEntryChanged(const QString&, const QString&)
{
    if (m_active)
        advance();
}

void InstallPlanner::onDetailFailed(const QString& type, const QString& name,
                                    const QString& error)
{
    if (!m_active)
        return;
    if (type == "game" && name == m_game) {
        // The list row already has revisions; carry on without the detail.
        m_requested.insert("root-failed");
        advance();
        return;
    }
    fail(QStringLiteral("Could not load dependency '%1': %2").arg(name, error));
}

QList<DepRef> InstallPlanner::depsOf(const QString& moduleName) const
{
    const GameEntry* e = m_repo->find(moduleName, "dep");
    return e ? e->dependencies : QList<DepRef>();
}

namespace {

bool isPipDep(const DepRef& d, const QMap<QString, bool>& resolved, bool* known)
{
    *known = true;
    if (d.source == "pip")
        return true;
    if (d.source == "pyracms")
        return false;
    const auto it = resolved.constFind(d.name);
    if (it == resolved.constEnd()) {
        *known = false;
        return false;
    }
    return it.value();
}

void walkDeps(const QList<DepRef>& deps, const EntryRepository& repo,
              const QMap<QString, bool>& resolved, QSet<QString>& seen, Walk& out)
{
    for (const DepRef& d : deps) {
        if (seen.contains(d.name))
            continue;
        seen.insert(d.name);
        bool known = true;
        const bool pip = isPipDep(d, resolved, &known);
        if (!known) {
            out.unknown << d.name;
            continue;
        }
        if (pip) {
            const QString spec = pipSpecFor(d);
            if (!out.pipSpecs.contains(spec))
                out.pipSpecs << spec;
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
            if (!out.pipSpecs.contains(s))
                out.pipSpecs << s;
        walkDeps(e->dependencies, repo, resolved, seen, out);
    }
}

} // namespace

void InstallPlanner::advance()
{
    if (!m_active)
        return;
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
        if (m_pipCheckRunning)
            return;
        m_pipCheckRunning = true;
        const int gen = m_generation;
        m_pip->check(walk.unknown, [this, gen](const QMap<QString, bool>& result) {
            if (gen != m_generation || !m_active)
                return;
            m_pipCheckRunning = false;
            for (auto it = result.cbegin(); it != result.cend(); ++it)
                m_isPip.insert(it.key(), it.value());
            advance();
        });
        return;
    }

    if (!walk.missing.isEmpty()) {
        fail(QStringLiteral("Dependency '%1' is neither on pip nor on this PyraCMS site")
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
    if (waiting)
        return;

    QString error;
    const InstallPlan plan = build(&error);
    if (!error.isEmpty()) {
        fail(error);
        return;
    }
    m_active = false;
    emit planReady(plan);
}

InstallPlan InstallPlanner::build(QString* error) const
{
    InstallPlan plan;
    const GameEntry* root = m_repo->find(m_game, "game");

    Walk walk;
    QSet<QString> seen;
    walkDeps(root->dependencies, *m_repo, m_isPip, seen, walk);

    const QString version = m_version.isEmpty() ? root->latestVersion() : m_version;
    const RevisionInfo* rev = root->revision(version);
    if (version.isEmpty() || !rev) {
        *error = version.isEmpty()
            ? QStringLiteral("%1 has no published version").arg(root->title())
            : QStringLiteral("Version %1 of %2 is not available").arg(version, root->title());
        return plan;
    }

    // PyraCMS dependency modules in install order (dependencies first).
    QList<DepRef> directModules;
    for (const DepRef& d : root->dependencies) {
        bool known = true;
        if (!isPipDep(d, m_isPip, &known))
            directModules << d;
    }
    QStringList cycles;
    const auto lookup = [this](const QString& name) {
        QList<DepRef> out;
        for (const DepRef& d : depsOf(name)) {
            bool known = true;
            if (!isPipDep(d, m_isPip, &known))
                out << d;
        }
        return out;
    };
    const QList<DepRef> ordered = DependencyResolver::resolveOrder(directModules, lookup, &cycles);

    for (const DepRef& dep : ordered) {
        const GameEntry* entry = m_repo->find(dep.name, "dep");
        if (!entry) {
            *error = QStringLiteral("Dependency '%1' is not available").arg(dep.name);
            return plan;
        }
        const QString want = dep.version.isEmpty() ? entry->latestVersion() : dep.version;
        const RevisionInfo* depRev = entry->revision(want);
        if (want.isEmpty() || !depRev) {
            *error = QStringLiteral("Dependency %1 version %2 is not published")
                         .arg(entry->title(), want.isEmpty() ? QStringLiteral("(any)") : want);
            return plan;
        }
        const DownloadTarget target = BinarySelector::resolveTarget(*depRev, "dep", m_os, m_arch);
        if (!target.ok) {
            *error = QStringLiteral("Dependency %1: %2").arg(entry->title(), target.error);
            return plan;
        }
        plan.depNames << dep.name;

        const QString have = m_installer->installedVersion(dep.name);
        if (!have.isEmpty() && VersionCompare::compare(have, depRev->version) == 0)
            continue;   // already installed in the right version

        PlanStep step;
        step.name = dep.name;
        step.version = depRev->version;
        step.type = "dep";
        step.target = target;
        plan.steps << step;
    }

    const DownloadTarget gameTarget = BinarySelector::resolveTarget(*rev, "game", m_os, m_arch);
    if (!gameTarget.ok) {
        *error = QStringLiteral("%1: %2").arg(root->title(), gameTarget.error);
        return plan;
    }
    PlanStep gameStep;
    gameStep.name = m_game;
    gameStep.version = rev->version;
    gameStep.type = "game";
    gameStep.target = gameTarget;
    plan.steps << gameStep;

    QStringList specs = root->pipRequirements;
    for (const QString& s : walk.pipSpecs)
        if (!specs.contains(s))
            specs << s;
    plan.pipSpecs = specs;
    if (!specs.isEmpty() || !gameTarget.nativeBuild) {
        PlanStep pip;
        pip.kind = PlanStep::Kind::Pip;
        pip.name = m_game;
        pip.pipSpecs = specs;
        plan.steps << pip;
    }

    plan.rootName = m_game;
    plan.rootVersion = rev->version;
    return plan;
}

} // namespace Hypernucleus
