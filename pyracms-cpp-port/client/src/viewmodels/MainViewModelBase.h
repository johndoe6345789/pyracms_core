#pragma once

#include <QObject>
#include <QStringList>
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
#include "viewmodels/ServiceHolder.h"
#include "viewmodels/SettingsViewModel.h"

namespace Hypernucleus {

// The properties QML binds to; actions live in MainViewModel.
class MainViewModelBase : public Hypernucleus::ServiceHolder {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Base of MainViewModel")
    Q_PROPERTY(Hypernucleus::GameFilterModel* library READ library CONSTANT)
    Q_PROPERTY(Hypernucleus::GameFilterModel* store READ store CONSTANT)
    Q_PROPERTY(Hypernucleus::DependencyModel* dependencies READ dependencies CONSTANT)
    Q_PROPERTY(Hypernucleus::DownloadCenter* downloads READ downloads CONSTANT)
    Q_PROPERTY(Hypernucleus::DeepLinkController* deepLinks READ deepLinks CONSTANT)
    Q_PROPERTY(Hypernucleus::SettingsViewModel* settingsEditor READ settingsEditor CONSTANT)
    Q_PROPERTY(Hypernucleus::SettingsManager* settings READ settings CONSTANT)
    Q_PROPERTY(Hypernucleus::AuthService* auth READ auth CONSTANT)
    Q_PROPERTY(Hypernucleus::GameManager* games READ games CONSTANT)
    Q_PROPERTY(Hypernucleus::PathManager* paths READ paths CONSTANT)
    Q_PROPERTY(QStringList categories READ categories NOTIFY categoriesChanged)
    Q_PROPERTY(QString favouritesCategory READ favouritesCategory CONSTANT)
    Q_PROPERTY(bool loading READ loading NOTIFY loadingChanged)
    Q_PROPERTY(
        QString catalogError READ catalogError NOTIFY catalogErrorChanged)
    Q_PROPERTY(QString selectedName READ selectedName NOTIFY selectedChanged)
    Q_PROPERTY(QVariantMap selected READ selected NOTIFY selectedChanged)
    Q_PROPERTY(QString gameLog READ gameLog NOTIFY gameLogChanged)
    Q_PROPERTY(QString appVersion READ appVersion CONSTANT)
    Q_PROPERTY(QString osName READ osName CONSTANT)

public:
    explicit MainViewModelBase(QObject* parent);
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

signals:
    void categoriesChanged();
    void loadingChanged();
    void catalogErrorChanged();
    void selectedChanged();
    void gameLogChanged();

protected:
    QString m_catalogError;
    QString m_selectedName;
    QVariantMap m_selected;
};

} // namespace Hypernucleus
