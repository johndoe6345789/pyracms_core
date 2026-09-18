#pragma once

class QObject;

namespace Hypernucleus {

class ApiClient;
class AuthService;
class DeepLinkController;
class DependencyModel;
class DownloadCenter;
class EntryRepository;
class GameDepModel;
class GameFilterModel;
class GameManager;
class InstallPlanner;
class InstallRunner;
class ModuleInstaller;
class PathManager;
class PipInstaller;
class PipResolver;
class SettingsManager;
class SettingsViewModel;

// Owns nothing itself: createServices() builds every service and model as a
// child of `owner`, in dependency order.
class ServiceHolder {
protected:
    void createServices(QObject* owner);

    SettingsManager* m_settings = nullptr;
    PathManager* m_paths = nullptr;
    ApiClient* m_api = nullptr;
    AuthService* m_auth = nullptr;
    EntryRepository* m_repo = nullptr;
    ModuleInstaller* m_installer = nullptr;
    PipInstaller* m_pip = nullptr;
    PipResolver* m_pipResolver = nullptr;
    InstallPlanner* m_planner = nullptr;
    InstallRunner* m_runner = nullptr;
    DownloadCenter* m_downloads = nullptr;
    GameManager* m_games = nullptr;
    GameDepModel* m_model = nullptr;
    GameFilterModel* m_library = nullptr;
    GameFilterModel* m_store = nullptr;
    DependencyModel* m_deps = nullptr;
    DeepLinkController* m_deepLinks = nullptr;
    SettingsViewModel* m_settingsEditor = nullptr;
};

} // namespace Hypernucleus
