#include "viewmodels/MainViewModel.h"
#include "viewmodels/DeepLinkController.h"
#include "viewmodels/DownloadCenter.h"
#include "viewmodels/SelectedGameView.h"
#include "viewmodels/SettingsViewModel.h"
#include "models/Constants.h"
#include "models/DependencyModel.h"
#include "models/GameDepModel.h"
#include "models/GameFilterModel.h"
#include "services/ApiClient.h"
#include "services/AuthService.h"
#include "services/EntryRepository.h"
#include "services/GameManager.h"
#include "services/InstallPlanner.h"
#include "services/InstallRunner.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"
#include "services/PipInstaller.h"
#include "services/PipResolver.h"
#include "services/SettingsManager.h"
#include "services/UrlSchemeRegistrar.h"

#include <QCoreApplication>
#include <QDesktopServices>
#include <QFileInfo>
#include <QUrl>

namespace Hypernucleus {

MainViewModel* MainViewModel::s_instance = nullptr;

void MainViewModel::setInstance(MainViewModel* instance)
{
    s_instance = instance;
}

MainViewModel* MainViewModel::create(QQmlEngine* engine, QJSEngine*)
{
    if (!s_instance)
        s_instance = new MainViewModel(engine);
    QJSEngine::setObjectOwnership(s_instance, QJSEngine::CppOwnership);
    return s_instance;
}

MainViewModel::MainViewModel(QObject* parent)
    : QObject(parent)
    , m_settings(new SettingsManager(this))
    , m_paths(new PathManager(m_settings->installDir(), QString(), this))
    , m_api(new ApiClient(this))
    , m_auth(new AuthService(m_api, m_settings, this))
    , m_repo(new EntryRepository(m_api, this))
    , m_installer(new ModuleInstaller(m_api, m_paths, this))
    , m_pip(new PipInstaller(m_paths, this))
    , m_pipResolver(new PipResolver(this))
    , m_planner(new InstallPlanner(m_repo, m_installer, m_pipResolver, this))
    , m_runner(new InstallRunner(m_installer, m_pip, this))
    , m_downloads(new DownloadCenter(m_planner, m_runner, this))
    , m_games(new GameManager(m_paths, m_installer, this))
    , m_model(new GameDepModel(this))
    , m_library(new GameFilterModel(this))
    , m_store(new GameFilterModel(this))
    , m_deps(new DependencyModel(this))
    , m_deepLinks(new DeepLinkController(this))
    , m_settingsEditor(new SettingsViewModel(m_settings, m_api, this))
{
    m_api->setBaseUrl(m_settings->repoUrl());
    m_api->setTenant(m_settings->tenantSlug());
    applyPlatformSettings();

    m_model->attach(m_repo, m_installer, m_api);
    m_library->setSourceModel(m_model);
    m_store->setSourceModel(m_model);

    m_selectedTimer.setSingleShot(true);
    m_selectedTimer.setInterval(60);
    connect(&m_selectedTimer, &QTimer::timeout, this, &MainViewModel::refreshSelected);

    // Settings -> services
    connect(m_settings, &SettingsManager::repoUrlChanged, this, [this]() {
        m_api->setBaseUrl(m_settings->repoUrl());
        refresh();
    });
    connect(m_settings, &SettingsManager::tenantSlugChanged, this, [this]() {
        m_api->setTenant(m_settings->tenantSlug());
    });
    connect(m_settings, &SettingsManager::installDirChanged, this, [this]() {
        m_paths->setDataDir(m_settings->installDir());
    });
    for (auto sig : {&SettingsManager::osNameChanged, &SettingsManager::archNameChanged,
                        &SettingsManager::pythonPathChanged, &SettingsManager::preferPipChanged}) {
        connect(m_settings, sig, this, &MainViewModel::applyPlatformSettings);
    }

    // Catalog
    connect(m_repo, &EntryRepository::refreshingChanged, this, &MainViewModel::loadingChanged);
    connect(m_repo, &EntryRepository::refreshed, this, [this]() {
        setCatalogError(QString());
        emit categoriesChanged();
        if (!m_selectedName.isEmpty() && !m_repo->find(m_selectedName, "game"))
            select(QString());
        else
            refreshSelected();
        if (m_pendingLink.valid()) {
            const LinkAction link = m_pendingLink;
            m_pendingLink = LinkAction();
            runLinkAction(link);
        }
    });
    connect(m_repo, &EntryRepository::refreshFailed, this, [this](const QString& error) {
        setCatalogError(error);
        emit notify(tr("Could not load games: %1").arg(error), true);
    });
    connect(m_repo, &EntryRepository::entryChanged, this, [this](const QString& type, const QString& name) {
        if (type == "game" && name == m_selectedName)
            refreshSelected();
        else if (type == "dep")
            m_selectedTimer.start();
    });
    connect(m_model, &GameDepModel::categoriesChanged, this, &MainViewModel::categoriesChanged);
    connect(m_installer, &ModuleInstaller::installStateChanged, this, &MainViewModel::refreshSelected);

    // Login
    connect(m_auth, &AuthService::loginSuccess, this, [this]() {
        emit notify(tr("Signed in as %1").arg(m_auth->username()), false);
        refresh();
    });
    connect(m_auth, &AuthService::loggedOut, this, &MainViewModel::refresh);

    wireInstallSignals();
    wireGameSignals();

    connect(m_deepLinks, &DeepLinkController::rejected, this, [this](const QString& error) {
        emit notify(tr("Ignored link: %1").arg(error), true);
    });
    connect(m_deepLinks, &DeepLinkController::accepted, this, &MainViewModel::onLinkAccepted);

    m_auth->restoreSession();
    refresh();
}

MainViewModel::~MainViewModel() = default;

QStringList MainViewModel::categories() const { return m_model->categories(); }
QString MainViewModel::favouritesCategory() const { return QLatin1String(CATEGORY_FAVOURITES); }
bool MainViewModel::loading() const { return m_repo->isRefreshing(); }
QString MainViewModel::gameLog() const { return m_games->log(); }
QString MainViewModel::appVersion() const { return QCoreApplication::applicationVersion(); }
QString MainViewModel::osName() const { return m_settings->osName(); }

void MainViewModel::setCatalogError(const QString& error)
{
    if (m_catalogError == error)
        return;
    m_catalogError = error;
    emit catalogErrorChanged();
}

void MainViewModel::applyPlatformSettings()
{
    m_planner->setPlatform(m_settings->osName(), m_settings->archName());
    m_planner->setPreferPip(m_settings->preferPip());
    m_games->setPlatform(m_settings->osName());
    m_games->setPythonPath(m_settings->pythonPath());
    m_pip->setPythonPath(m_settings->pythonPath());
}

void MainViewModel::wireInstallSignals()
{
    connect(m_downloads, &DownloadCenter::gameStateChanged, this,
            [this](const QString& name, int state, double progress, const QString& text) {
        m_model->setTransient(name, state, progress, text);
        if (name == m_selectedName && !m_selectedTimer.isActive())
            m_selectedTimer.start();
    });
    connect(m_downloads, &DownloadCenter::gameFinished, this,
            [this](const QString& name, const QString& version) {
        m_model->clearTransient(name);
        emit notify(tr("%1 %2 installed").arg(name, version), false);
        refreshSelected();
        if (m_launchAfterInstall == name) {
            m_launchAfterInstall.clear();
            launch(name);
        }
    });
    connect(m_downloads, &DownloadCenter::gameFailed, this,
            [this](const QString& name, const QString& error) {
        m_model->setTransient(name, GameStates::InstallFailed, 0.0, error);
        m_launchAfterInstall.clear();
        emit notify(tr("Installing %1 failed: %2").arg(name, error), true);
        refreshSelected();
    });
    connect(m_downloads, &DownloadCenter::gameCancelled, this, [this](const QString& name) {
        m_model->clearTransient(name);
        if (m_launchAfterInstall == name)
            m_launchAfterInstall.clear();
        refreshSelected();
    });
    connect(m_installer, &ModuleInstaller::uninstallComplete, this, [this](const QString& name) {
        m_model->clearTransient(name);
        emit notify(tr("%1 uninstalled").arg(name), false);
    });
    connect(m_installer, &ModuleInstaller::uninstallFailed, this,
            [this](const QString& name, const QString& error) {
        emit notify(tr("Could not uninstall %1: %2").arg(name, error), true);
    });
}

void MainViewModel::wireGameSignals()
{
    connect(m_games, &GameManager::gameStarted, this, [this](const QString& name) {
        m_model->setTransient(name, GameStates::Running, 0.0, tr("Running"));
        refreshSelected();
    });
    connect(m_games, &GameManager::gameStopped, this, [this](const QString& name) {
        m_model->clearTransient(name);
        refreshSelected();
    });
    connect(m_games, &GameManager::gameError, this,
            [this](const QString& name, const QString& error) {
        m_model->setTransient(name, GameStates::LaunchFailed, 0.0, error);
        emit notify(tr("%1: %2").arg(name, error), true);
        refreshSelected();
    });
    connect(m_games, &GameManager::logChanged, this, &MainViewModel::gameLogChanged);
}

void MainViewModel::refresh()
{
    setCatalogError(QString());
    m_repo->refresh();
}

void MainViewModel::select(const QString& name)
{
    m_selectedName = name;
    m_selectedVersion.clear();
    if (!name.isEmpty())
        m_repo->ensureDetail("game", name);
    refreshSelected();
}

void MainViewModel::selectVersion(const QString& version)
{
    m_selectedVersion = version;
    refreshSelected();
}

void MainViewModel::refreshSelected()
{
    const GameEntry* e = m_selectedName.isEmpty() ? nullptr : m_repo->find(m_selectedName, "game");
    if (!e) {
        m_selected.clear();
        m_deps->clear();
        emit selectedChanged();
        return;
    }
    SelectedGameView::Input in;
    in.entry = e;
    in.record = m_installer->record(e->name);
    in.state = m_model->stateOf(e->name);
    in.progress = m_model->progressOf(e->name);
    in.statusText = m_model->statusTextOf(e->name);
    in.selectedVersion = m_selectedVersion;
    in.accent = m_model->accentOf(e->name);
    in.mediaUrl = [this](const QString& path) { return m_api->resolveUrl(path).toString(); };
    m_selected = SelectedGameView::build(in);
    m_selected["favourite"] = m_model->isFavourite(e->name);
    m_deps->populate(e->dependencies, m_installer->installedVersions());
    emit selectedChanged();
}

void MainViewModel::primaryAction()
{
    if (m_selectedName.isEmpty())
        return;
    const QString kind = m_selected.value("primaryKind").toString();
    dispatch(m_selectedName, kind, m_selectedVersion);
}

void MainViewModel::primaryActionFor(const QString& name)
{
    const SelectedGameView::Primary p = SelectedGameView::primaryFor(
        m_model->stateOf(name), m_model->progressOf(name),
        m_installer->installedVersion(name), QString());
    dispatch(name, p.kind, QString());
}

void MainViewModel::dispatch(const QString& name, const QString& kind, const QString& version)
{
    if (kind == "install" || kind == "update")
        install(name, version);
    else if (kind == "play")
        launch(name);
    else if (kind == "stop")
        stop();
    else if (kind == "cancel")
        cancelDownload(name);
}

void MainViewModel::install(const QString& name, const QString& version)
{
    if (!m_repo->find(name, "game")) {
        emit notify(tr("Unknown game: %1").arg(name), true);
        return;
    }
    m_downloads->enqueue(name, version);
}

void MainViewModel::uninstall(const QString& name)
{
    if (m_games->isRunning() && m_games->currentGame() == name)
        m_games->stopGame();
    m_installer->uninstall(name, m_installer->installedVersion(name), "game");
}

void MainViewModel::launch(const QString& name)
{
    if (!m_installer->isInstalled(name)) {
        emit notify(tr("%1 is not installed").arg(name), true);
        return;
    }
    m_model->setTransient(name, GameStates::Launching, 0.0, tr("Launching"));
    refreshSelected();
    m_games->launchGame(name);
}

void MainViewModel::stop()
{
    m_games->stopGame();
}

void MainViewModel::cancelDownload(const QString& name)
{
    if (m_downloads->activeName() == name)
        m_downloads->cancelActive();
    else
        m_downloads->removeQueued(name);
}

void MainViewModel::toggleFavourite(const QString& name)
{
    m_model->toggleFavourite(name);
    refreshSelected();
}

void MainViewModel::openInstallFolder(const QString& name)
{
    const QString path = m_installer->installPath(name);
    if (!path.isEmpty())
        QDesktopServices::openUrl(QUrl::fromLocalFile(path));
}

void MainViewModel::openLogFile(const QString& name)
{
    const QString path = m_games->logFilePath(name);
    if (QFileInfo::exists(path))
        QDesktopServices::openUrl(QUrl::fromLocalFile(path));
    else
        emit notify(tr("No log yet for %1").arg(name), false);
}

void MainViewModel::logout()
{
    m_auth->logout();
}

void MainViewModel::registerUrlScheme()
{
    QString error;
    if (UrlSchemeRegistrar::registerForCurrentUser(QCoreApplication::applicationFilePath(), &error))
        emit notify(tr("pyracms:// links now open Hypernucleus"), false);
    else
        emit notify(error, true);
}

// --- pyracms:// links ------------------------------------------------------

void MainViewModel::handleUrl(const QString& url)
{
    emit raiseWindow();
    if (!m_deepLinks->setUrl(url, m_settings->tenantSlug()))
        return;
    const DeepLink link = m_deepLinks->link();
    // Starting an installed game from the same site is harmless; installing
    // something or switching sites always asks first.
    if (link.action == DeepLink::Action::Launch && !m_deepLinks->siteMismatch()
        && !m_settings->tenantSlug().isEmpty() && m_installer->isInstalled(link.name)) {
        m_deepLinks->accept();
    }
}

void MainViewModel::onLinkAccepted(const QString& action, const QString& slug, const QString& name)
{
    const LinkAction link{action, name};
    if (slug != m_settings->tenantSlug()) {
        // Accounts and catalogs are per site: switch, then continue.
        m_pendingLink = link;
        m_settings->setTenantSlug(slug);   // also updates the API client
        m_settings->save();
        if (m_auth->isAuthenticated())
            m_auth->logout();              // loggedOut -> refresh()
        else
            refresh();
        return;
    }
    if (!m_repo->isLoaded()) {
        m_pendingLink = link;
        return;   // refreshed() continues
    }
    runLinkAction(link);
}

void MainViewModel::runLinkAction(const LinkAction& link)
{
    if (!m_repo->find(link.name, "game")) {
        emit notify(tr("'%1' was not found on this site").arg(link.name), true);
        return;
    }
    select(link.name);
    emit showGame(link.name);
    if (link.action == "install") {
        install(link.name, QString());
    } else if (m_installer->isInstalled(link.name)) {
        launch(link.name);
    } else {
        m_launchAfterInstall = link.name;
        install(link.name, QString());
    }
}

} // namespace Hypernucleus
