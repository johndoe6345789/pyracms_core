#pragma once

#include <QJSEngine>
#include <QQmlEngine>
#include <QTimer>
#include <QtQml/qqmlregistration.h>

#include "viewmodels/MainViewModelBase.h"

namespace Hypernucleus {

// The one object QML talks to: turns button presses into installs/launches.
class MainViewModel : public Hypernucleus::MainViewModelBase {
    Q_OBJECT
    QML_ELEMENT
    QML_SINGLETON

public:
    // No default constructor on purpose: QML must use create() so the QML
    // singleton is the very instance main() made.
    explicit MainViewModel(QObject* parent);
    ~MainViewModel() override;

    static void setInstance(MainViewModel* instance);
    static MainViewModel* create(QQmlEngine* engine, QJSEngine* scriptEngine);

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
    // After a language change: re-evaluate the texts made in C++.
    void retranslate();

signals:
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
    void wireSettings();
    void wireCatalog();
    void wireAuth();
    void wireInstallSignals();
    void wireGameSignals();
    void refreshSelected();
    void dispatch(const QString& name, const QString& kind,
                  const QString& version);
    void onLinkAccepted(const QString& action, const QString& slug,
                        const QString& name);
    void runLinkAction(const LinkAction& link);
    void setCatalogError(const QString& error);

    QString m_selectedVersion;
    QTimer m_selectedTimer;
    LinkAction m_pendingLink; // waits for the catalog to load
    QString m_launchAfterInstall;

    static MainViewModel* s_instance;
};

} // namespace Hypernucleus
