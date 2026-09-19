#include "viewmodels/ServiceHolder.h"
#include "viewmodels/MainViewModelDeps.h"

namespace Hypernucleus {

void ServiceHolder::createServices(QObject* o)
{
    m_settings = new SettingsManager(o);
    m_paths = new PathManager(m_settings->installDir(), QString(), o);
    m_api = new ApiClient(o);
    m_auth = new AuthService(m_api, m_settings, o);
    m_repo = new EntryRepository(m_api, o);
    m_installer = new ModuleInstaller(m_api, m_paths, o);
    m_pip = new PipInstaller(m_paths, o);
    m_pipResolver = new PipResolver(o);
    m_planner = new InstallPlanner(m_repo, m_installer, m_pipResolver, o);
    m_runner = new InstallRunner(m_installer, m_pip, o);
    m_downloads = new DownloadCenter(m_planner, m_runner, o);
    m_games = new GameManager(m_paths, m_installer, o);
    m_model = new GameDepModel(o);
    m_library = new GameFilterModel(o);
    m_store = new GameFilterModel(o);
    m_deps = new DependencyModel(o);
    m_deepLinks = new DeepLinkController(o);
    m_settingsEditor = new SettingsViewModel(m_settings, m_api, o);
    m_python = new PythonSetup(m_paths, m_api, m_settings, m_pip, m_games,
                               m_downloads, o);
    auto* sites = new SiteDirectory(m_api, o);
    m_connect = new ConnectController(m_settings, sites, o);
}

} // namespace Hypernucleus
