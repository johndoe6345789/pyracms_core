#include "services/InstallPlanner.h"
#include "services/EntryRepository.h"
#include "services/ModuleInstaller.h"
#include "services/PipResolver.h"
#include "domain/DependencyResolver.h"
#include "domain/VersionCompare.h"

namespace Hypernucleus {

InstallPlanner::InstallPlanner(EntryRepository* repo,
                               ModuleInstaller* installer, PipResolver* pip,
                               QObject* parent)
    : QObject(parent), m_repo(repo), m_installer(installer), m_pip(pip)
{
    connect(m_repo, &EntryRepository::entryChanged, this,
            &InstallPlanner::onEntryChanged);
    connect(m_repo, &EntryRepository::detailFailed, this,
            &InstallPlanner::onDetailFailed);
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
    if (m_active) advance();
}

void InstallPlanner::onDetailFailed(const QString& type, const QString& name,
                                    const QString& error)
{
    if (!m_active) return;
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

} // namespace Hypernucleus
