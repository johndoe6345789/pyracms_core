#include "viewmodels/MainViewModel.h"
#include "models/GameDepModel.h"
#include "models/DependencyModel.h"
#include "services/ApiClient.h"
#include "services/AuthService.h"
#include "services/SettingsManager.h"
#include "services/PathManager.h"
#include "services/ModuleInstaller.h"
#include "services/GameManager.h"

#include <QJsonArray>

namespace Hypernucleus {

MainViewModel::MainViewModel(QObject* parent)
    : QObject(parent)
    , m_settingsManager(new SettingsManager(this))
    , m_pathManager(new PathManager(this))
    , m_apiClient(new ApiClient(this))
    , m_authService(new AuthService(m_apiClient, m_settingsManager, this))
    , m_installer(new ModuleInstaller(m_apiClient, m_pathManager, this))
    , m_gameManager(new GameManager(m_pathManager, m_installer, this))
    , m_gameDepModel(new GameDepModel(this))
    , m_dependencyModel(new DependencyModel(this))
{
    // Sync API base URL with settings
    m_apiClient->setBaseUrl(m_settingsManager->repoUrl());
    connect(m_settingsManager, &SettingsManager::repoUrlChanged, this, [this]() {
        m_apiClient->setBaseUrl(m_settingsManager->repoUrl());
    });

    // Loading state
    connect(m_apiClient, &ApiClient::loadingChanged, this, [this]() {
        if (m_isLoading != m_apiClient->isLoading()) {
            m_isLoading = m_apiClient->isLoading();
            emit isLoadingChanged();
        }
    });

    // Catalog fetched
    connect(m_apiClient, &ApiClient::catalogFetched,
            this, &MainViewModel::onCatalogFetched);

    // Network errors
    connect(m_apiClient, &ApiClient::networkError, this, [this](const QString& msg) {
        setStatusMessage("Error: " + msg);
        emit errorOccurred("Network Error", msg);
    });

    // Install progress
    connect(m_installer, &ModuleInstaller::downloadProgress,
            this, [this](const QString& name, qint64 received, qint64 total) {
        m_progressName = name;
        m_showProgress = true;
        if (total > 0) {
            m_progressValue = static_cast<double>(received) / static_cast<double>(total);
            m_progressText = QString("Downloading %1: %2 / %3 MB")
                .arg(name)
                .arg(received / 1048576.0, 0, 'f', 1)
                .arg(total / 1048576.0, 0, 'f', 1);
        } else {
            m_progressValue = -1; // indeterminate
            m_progressText = QString("Downloading %1: %2 MB")
                .arg(name)
                .arg(received / 1048576.0, 0, 'f', 1);
        }
        emit progressChanged();
    });

    connect(m_installer, &ModuleInstaller::extractionStarted,
            this, [this](const QString& name) {
        m_progressName = name;
        m_progressValue = -1;
        m_progressText = QString("Extracting %1...").arg(name);
        m_showProgress = true;
        emit progressChanged();
    });

    connect(m_installer, &ModuleInstaller::installComplete,
            this, [this](const QString& name, const QString& version) {
        m_showProgress = false;
        emit progressChanged();
        setStatusMessage(QString("Installed %1 v%2").arg(name, version));
        m_gameDepModel->markInstalled(name, version);
        updateDependencyModel();
    });

    connect(m_installer, &ModuleInstaller::installFailed,
            this, [this](const QString& name, const QString& error) {
        m_showProgress = false;
        emit progressChanged();
        setStatusMessage(QString("Failed to install %1: %2").arg(name, error));
        emit errorOccurred("Install Failed", error);
    });

    connect(m_installer, &ModuleInstaller::uninstallComplete,
            this, [this](const QString& name) {
        setStatusMessage(QString("Uninstalled %1").arg(name));
        m_gameDepModel->markUninstalled(name);
        updateDependencyModel();
    });

    // Game manager signals
    connect(m_gameManager, &GameManager::gameStarted, this, [this](const QString& name) {
        setStatusMessage(QString("Started %1").arg(name));
        emit gameRunningChanged();
        emit currentGameNameChanged();
    });

    connect(m_gameManager, &GameManager::gameStopped, this, [this](const QString& name) {
        setStatusMessage(QString("Stopped %1").arg(name));
        emit gameRunningChanged();
        emit currentGameNameChanged();
    });

    connect(m_gameManager, &GameManager::gameError,
            this, [this](const QString& name, const QString& error) {
        setStatusMessage(QString("Game error (%1): %2").arg(name, error));
        emit gameRunningChanged();
        emit currentGameNameChanged();
        emit errorOccurred("Game Error", error);
    });

    // Restore auth session
    m_authService->restoreSession();
}

MainViewModel::~MainViewModel() = default;

GameDepModel* MainViewModel::gameDepModel() const { return m_gameDepModel; }
DependencyModel* MainViewModel::dependencyModel() const { return m_dependencyModel; }
QJsonObject MainViewModel::selectedItem() const { return m_selectedItem; }
int MainViewModel::selectedType() const { return m_selectedType; }

QString MainViewModel::searchText() const { return m_searchText; }

void MainViewModel::setSearchText(const QString& text)
{
    if (m_searchText == text) return;
    m_searchText = text;
    emit searchTextChanged();
    m_gameDepModel->setSearchText(text);
}

bool MainViewModel::isLoading() const { return m_isLoading; }
QString MainViewModel::statusMessage() const { return m_statusMessage; }
bool MainViewModel::gameRunning() const { return m_gameManager->isRunning(); }
QString MainViewModel::currentGameName() const { return m_gameManager->currentGame(); }
QString MainViewModel::progressName() const { return m_progressName; }
double MainViewModel::progressValue() const { return m_progressValue; }
QString MainViewModel::progressText() const { return m_progressText; }
bool MainViewModel::showProgress() const { return m_showProgress; }

ApiClient* MainViewModel::apiClient() const { return m_apiClient; }
AuthService* MainViewModel::authService() const { return m_authService; }
SettingsManager* MainViewModel::settingsManager() const { return m_settingsManager; }
PathManager* MainViewModel::pathManager() const { return m_pathManager; }
GameManager* MainViewModel::gameManager() const { return m_gameManager; }

void MainViewModel::refreshCatalog()
{
    setStatusMessage("Fetching catalog...");
    m_apiClient->fetchCatalog();
}

void MainViewModel::selectItem(int row, int parentRow)
{
    QModelIndex parentIndex;
    if (parentRow >= 0) {
        parentIndex = m_gameDepModel->index(parentRow, 0);
    }
    QModelIndex index = m_gameDepModel->index(row, 0, parentIndex);
    if (!index.isValid())
        return;

    QJsonObject data = m_gameDepModel->itemData(index);
    if (data.isEmpty() || data.value("type").toString() == "category")
        return;

    m_selectedItem = data;
    emit selectedItemChanged();

    QString type = data.value("type").toString();
    m_selectedType = (type == "game")
        ? static_cast<int>(ItemType::Game)
        : static_cast<int>(ItemType::Dep);
    emit selectedTypeChanged();

    updateDependencyModel();
    setStatusMessage(QString("Selected: %1").arg(
        data.value("displayName").toString(data.value("name").toString())));
}

void MainViewModel::installSelected()
{
    if (m_selectedItem.isEmpty()) {
        emit errorOccurred("No Selection", "Please select an item to install.");
        return;
    }

    QString name = m_selectedItem.value("name").toString();
    QString type = m_selectedItem.value("type").toString();
    QJsonObject revisions = m_selectedItem.value("revisions").toObject();

    if (revisions.isEmpty()) {
        emit errorOccurred("No Revisions", "No revisions available for " + name);
        return;
    }

    // Get the latest revision
    QString latestVersion;
    QJsonObject latestRevision;
    for (auto it = revisions.begin(); it != revisions.end(); ++it) {
        latestVersion = it.key();
        latestRevision = it.value().toObject();
    }

    // First install dependencies
    QJsonArray deps = m_selectedItem.value("dependencies").toArray();
    if (!deps.isEmpty()) {
        auto resolvedDeps = m_installer->resolveDependencies(deps, m_catalog);
        for (const auto& dep : resolvedDeps) {
            const QString& depName = dep.first;
            const QString& depVersion = dep.second;

            QJsonObject depsSection = m_catalog.value("dependencies").toObject();
            if (depsSection.contains(depName)) {
                QJsonObject depEntry = depsSection[depName].toObject();
                QJsonObject depRevisions = depEntry.value("revisions").toObject();
                if (depRevisions.contains(depVersion)) {
                    m_installer->install(depName, depVersion,
                                         depRevisions[depVersion].toObject(), "dep");
                }
            }
        }
    }

    // Then install the selected item
    m_installer->install(name, latestVersion, latestRevision, type);
}

void MainViewModel::uninstallSelected()
{
    if (m_selectedItem.isEmpty()) {
        emit errorOccurred("No Selection", "Please select an item to uninstall.");
        return;
    }

    QString name = m_selectedItem.value("name").toString();
    QString type = m_selectedItem.value("type").toString();
    QString version = m_selectedItem.value("installedVersion").toString();

    if (version.isEmpty()) {
        emit errorOccurred("Not Installed", name + " is not installed.");
        return;
    }

    m_installer->uninstall(name, version, type);
}

void MainViewModel::launchSelected()
{
    if (m_selectedItem.isEmpty()) {
        emit errorOccurred("No Selection", "Please select a game to launch.");
        return;
    }

    if (m_selectedItem.value("type").toString() != "game") {
        emit errorOccurred("Not a Game", "Only games can be launched.");
        return;
    }

    QString name = m_selectedItem.value("name").toString();
    QString version = m_selectedItem.value("installedVersion").toString();
    if (version.isEmpty()) {
        emit errorOccurred("Not Installed", "Install the game before launching.");
        return;
    }

    QJsonObject revisions = m_selectedItem.value("revisions").toObject();
    QJsonObject revisionData = revisions.value(version).toObject();

    m_gameManager->launchGame(name, version, revisionData);
}

void MainViewModel::stopGame()
{
    m_gameManager->stopGame();
}

void MainViewModel::search(const QString& text)
{
    setSearchText(text);
}

void MainViewModel::setStatusMessage(const QString& msg)
{
    if (m_statusMessage == msg) return;
    m_statusMessage = msg;
    emit statusMessageChanged();
}

void MainViewModel::onCatalogFetched(const QJsonObject& catalog)
{
    m_catalog = catalog;

    // Mark installed items in the model
    auto installed = m_installer->installedVersions();
    m_gameDepModel->populate(catalog);
    for (auto it = installed.cbegin(); it != installed.cend(); ++it) {
        m_gameDepModel->markInstalled(it.key(), it.value());
    }

    int gameCount = catalog.value("games").toObject().size();
    int depCount = catalog.value("dependencies").toObject().size();
    setStatusMessage(QString("Catalog loaded: %1 games, %2 dependencies")
                     .arg(gameCount).arg(depCount));
}

void MainViewModel::updateDependencyModel()
{
    QJsonArray deps = m_selectedItem.value("dependencies").toArray();
    m_dependencyModel->populate(deps, m_installer->installedVersions());
}

} // namespace Hypernucleus
