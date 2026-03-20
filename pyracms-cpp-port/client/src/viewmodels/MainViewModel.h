#pragma once

#include <QObject>
#include <QJsonObject>
#include <QModelIndex>
#include <QString>

#include "models/Constants.h"

namespace Hypernucleus {

class ApiClient;
class AuthService;
class GameDepModel;
class DependencyModel;
class ModuleInstaller;
class GameManager;
class PathManager;
class SettingsManager;

class MainViewModel : public QObject {
    Q_OBJECT
    Q_PROPERTY(GameDepModel* gameDepModel READ gameDepModel CONSTANT)
    Q_PROPERTY(DependencyModel* dependencyModel READ dependencyModel CONSTANT)
    Q_PROPERTY(QJsonObject selectedItem READ selectedItem NOTIFY selectedItemChanged)
    Q_PROPERTY(int selectedType READ selectedType NOTIFY selectedTypeChanged)
    Q_PROPERTY(QString searchText READ searchText WRITE setSearchText NOTIFY searchTextChanged)
    Q_PROPERTY(bool isLoading READ isLoading NOTIFY isLoadingChanged)
    Q_PROPERTY(QString statusMessage READ statusMessage NOTIFY statusMessageChanged)
    Q_PROPERTY(bool gameRunning READ gameRunning NOTIFY gameRunningChanged)
    Q_PROPERTY(QString currentGameName READ currentGameName NOTIFY currentGameNameChanged)
    Q_PROPERTY(QString progressName READ progressName NOTIFY progressChanged)
    Q_PROPERTY(double progressValue READ progressValue NOTIFY progressChanged)
    Q_PROPERTY(QString progressText READ progressText NOTIFY progressChanged)
    Q_PROPERTY(bool showProgress READ showProgress NOTIFY progressChanged)

    // Expose sub-objects to QML
    Q_PROPERTY(ApiClient* apiClient READ apiClient CONSTANT)
    Q_PROPERTY(AuthService* authService READ authService CONSTANT)
    Q_PROPERTY(SettingsManager* settingsManager READ settingsManager CONSTANT)
    Q_PROPERTY(PathManager* pathManager READ pathManager CONSTANT)
    Q_PROPERTY(GameManager* gameManager READ gameManager CONSTANT)

public:
    explicit MainViewModel(QObject* parent = nullptr);
    ~MainViewModel() override;

    // Property accessors
    GameDepModel* gameDepModel() const;
    DependencyModel* dependencyModel() const;
    QJsonObject selectedItem() const;
    int selectedType() const;
    QString searchText() const;
    void setSearchText(const QString& text);
    bool isLoading() const;
    QString statusMessage() const;
    bool gameRunning() const;
    QString currentGameName() const;
    QString progressName() const;
    double progressValue() const;
    QString progressText() const;
    bool showProgress() const;

    ApiClient* apiClient() const;
    AuthService* authService() const;
    SettingsManager* settingsManager() const;
    PathManager* pathManager() const;
    GameManager* gameManager() const;

    // Public slots
    Q_INVOKABLE void refreshCatalog();
    Q_INVOKABLE void selectItem(int row, int parentRow);
    Q_INVOKABLE void installSelected();
    Q_INVOKABLE void uninstallSelected();
    Q_INVOKABLE void launchSelected();
    Q_INVOKABLE void stopGame();
    Q_INVOKABLE void search(const QString& text);

signals:
    void selectedItemChanged();
    void selectedTypeChanged();
    void searchTextChanged();
    void isLoadingChanged();
    void statusMessageChanged();
    void gameRunningChanged();
    void currentGameNameChanged();
    void progressChanged();
    void errorOccurred(const QString& title, const QString& message);

private:
    void setStatusMessage(const QString& msg);
    void onCatalogFetched(const QJsonObject& catalog);
    void updateDependencyModel();

    ApiClient* m_apiClient;
    AuthService* m_authService;
    SettingsManager* m_settingsManager;
    PathManager* m_pathManager;
    ModuleInstaller* m_installer;
    GameManager* m_gameManager;
    GameDepModel* m_gameDepModel;
    DependencyModel* m_dependencyModel;

    QJsonObject m_selectedItem;
    int m_selectedType = static_cast<int>(ItemType::Game);
    QString m_searchText;
    bool m_isLoading = false;
    QString m_statusMessage;
    QJsonObject m_catalog;

    // Progress tracking
    QString m_progressName;
    double m_progressValue = 0.0;
    QString m_progressText;
    bool m_showProgress = false;
};

} // namespace Hypernucleus
