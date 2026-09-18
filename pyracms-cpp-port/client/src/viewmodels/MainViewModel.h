#pragma once

#include <QJSEngine>
#include <QObject>
#include <QQmlEngine>
#include <QStringList>
#include <QTimer>
#include <QVariantMap>
#include <QtQml/qqmlregistration.h>

// Complete types are required by moc for pointer-typed Q_PROPERTYs.
#include "models/DependencyModel.h"
#include "models/GameFilterModel.h"
#include "services/AuthService.h"
#include "services/GameManager.h"
#include "services/PathManager.h"
#include "services/SettingsManager.h"
#include "viewmodels/DeepLinkController.h"
#include "viewmodels/DownloadCenter.h"
#include "viewmodels/SettingsViewModel.h"

namespace Hypernucleus {

class ApiClient;
class EntryRepository;
class GameDepModel;
class InstallPlanner;
class InstallRunner;
class ModuleInstaller;
class PipInstaller;
class PipResolver;

// The one object QML talks to: owns the services and models, tracks the
// selected game and turns button presses into installs / launches.
class MainViewModel : public QObject {
    Q_OBJECT
    QML_ELEMENT
    QML_SINGLETON

    Q_PROPERTY(GameFilterModel* library READ library CONSTANT)
    Q_PROPERTY(GameFilterModel* store READ store CONSTANT)
    Q_PROPERTY(DependencyModel* dependencies READ dependencies CONSTANT)
    Q_PROPERTY(DownloadCenter* downloads READ downloads CONSTANT)
    Q_PROPERTY(DeepLinkController* deepLinks READ deepLinks CONSTANT)
    Q_PROPERTY(SettingsViewModel* settingsEditor READ settingsEditor CONSTANT)
    Q_PROPERTY(SettingsManager* settings READ settings CONSTANT)
    Q_PROPERTY(AuthService* auth READ auth CONSTANT)
    Q_PROPERTY(GameManager* games READ games CONSTANT)
    Q_PROPERTY(PathManager* paths READ paths CONSTANT)

    Q_PROPERTY(QStringList categories READ categories NOTIFY categoriesChanged)
    Q_PROPERTY(QString favouritesCategory READ favouritesCategory CONSTANT)
    Q_PROPERTY(bool loading READ loading NOTIFY loadingChanged)
    Q_PROPERTY(QString catalogError READ catalogError NOTIFY catalogErrorChanged)
    Q_PROPERTY(QString selectedName READ selectedName NOTIFY selectedChanged)
    Q_PROPERTY(QVariantMap selected READ selected NOTIFY selectedChanged)
    Q_PROPERTY(QString gameLog READ gameLog NOTIFY gameLogChanged)
    Q_PROPERTY(QString appVersion READ appVersion CONSTANT)
    Q_PROPERTY(QString osName READ osName CONSTANT)

public:
    explicit MainViewModel(QObject* parent = nullptr);
    ~MainViewModel() override;

    // QML_SINGLETON hooks: main() creates the instance and registers it.
    static void setInstance(MainViewModel* instance);
    static MainViewModel* create(QQmlEngine* engine, QJSEngine* scriptEngine);

    GameFilterModel* library() const { return m_library; }
    GameFilterModel* store() const { return m_store; }
    DependencyModel* dependencies() const { return m_deps; }
    DownloadCenter* downloads() const { return m_downloads; }
    DeepLinkController* deepLinks() const { return m_deepLinks; }
    SettingsViewModel* settingsEditor() const { return m_settingsEditor; }
    SettingsManager* settings() const { return m_settings; }
    AuthService* auth() const { return m_auth; }
    GameManager* games() const { return m_games; }
    PathManager* paths() const { return m_paths; }

    QStringList categories() const;
    QString favouritesCategory() const;
    bool loading() const;
    QString catalogError() const { return m_catalogError; }
    QString selectedName() const { return m_selectedName; }
    QVariantMap selected() const { return m_selected; }
    QString gameLog() const;
    QString appVersion() const;
    QString osName() const;

    Q_INVOKABLE void refresh();
    Q_INVOKABLE void select(const QString& name);
    Q_INVOKABLE void selectVersion(const QString& version);

    // Primary button of the selected game / of any game card.
    Q_INVOKABLE void primaryAction();
    Q_INVOKABLE void primaryActionFor(const QString& name);
    Q_INVOKABLE void install(const QString& name, const QString& version);
    Q_INVOKABLE void uninstall(const QString& name);
    Q_INVOKABLE void launch(const QString& name);
    Q_INVOKABLE void stop();
    Q_INVOKABLE void cancelDownload(const QString& name);
    Q_INVOKABLE void toggleFavourite(const QString& name);
    Q_INVOKABLE void openInstallFolder(const QString& name);
    Q_INVOKABLE void openLogFile(const QString& name);
    Q_INVOKABLE void logout();

    // pyracms://launch/<slug>/<name>, pyracms://install/<slug>/<name>
    Q_INVOKABLE void handleUrl(const QString& url);
    Q_INVOKABLE void registerUrlScheme();

signals:
    void categoriesChanged();
    void loadingChanged();
    void catalogErrorChanged();
    void selectedChanged();
    void gameLogChanged();
    void notify(const QString& message, bool isError);
    void raiseWindow();
    void showGame(const QString& name);

private:
    struct LinkAction {
        QString action;
        QString name;
        bool valid() const { return !action.isEmpty(); }
    };

    void applyPlatformSettings();
    void wireInstallSignals();
    void wireGameSignals();
    void refreshSelected();
    void dispatch(const QString& name, const QString& kind, const QString& version);
    void onLinkAccepted(const QString& action, const QString& slug, const QString& name);
    void runLinkAction(const LinkAction& link);
    void setCatalogError(const QString& error);

    SettingsManager* m_settings;
    PathManager* m_paths;
    ApiClient* m_api;
    AuthService* m_auth;
    EntryRepository* m_repo;
    ModuleInstaller* m_installer;
    PipInstaller* m_pip;
    PipResolver* m_pipResolver;
    InstallPlanner* m_planner;
    InstallRunner* m_runner;
    DownloadCenter* m_downloads;
    GameManager* m_games;
    GameDepModel* m_model;
    GameFilterModel* m_library;
    GameFilterModel* m_store;
    DependencyModel* m_deps;
    DeepLinkController* m_deepLinks;
    SettingsViewModel* m_settingsEditor;

    QString m_catalogError;
    QString m_selectedName;
    QString m_selectedVersion;
    QVariantMap m_selected;
    QTimer m_selectedTimer;
    LinkAction m_pendingLink;       // waits for the catalog to load
    QString m_launchAfterInstall;

    static MainViewModel* s_instance;
};

} // namespace Hypernucleus
