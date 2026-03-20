#pragma once

#include <QObject>
#include <QStringList>
#include <QString>

namespace Hypernucleus {

class SettingsManager;
class ApiClient;

class SettingsViewModel : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString repoUrl READ repoUrl WRITE setRepoUrl NOTIFY repoUrlChanged)
    Q_PROPERTY(QString osName READ osName WRITE setOsName NOTIFY osNameChanged)
    Q_PROPERTY(QString archName READ archName WRITE setArchName NOTIFY archNameChanged)
    Q_PROPERTY(QStringList osList READ osList NOTIFY osListChanged)
    Q_PROPERTY(QStringList archList READ archList NOTIFY archListChanged)
    Q_PROPERTY(int chunkSize READ chunkSize WRITE setChunkSize NOTIFY chunkSizeChanged)
    Q_PROPERTY(bool isDirty READ isDirty NOTIFY isDirtyChanged)
    Q_PROPERTY(QString urlError READ urlError NOTIFY urlErrorChanged)

public:
    explicit SettingsViewModel(SettingsManager* settings, ApiClient* apiClient,
                               QObject* parent = nullptr);

    // Property accessors
    QString repoUrl() const;
    void setRepoUrl(const QString& url);

    QString osName() const;
    void setOsName(const QString& name);

    QString archName() const;
    void setArchName(const QString& name);

    QStringList osList() const;
    QStringList archList() const;

    int chunkSize() const;
    void setChunkSize(int size);

    bool isDirty() const;
    QString urlError() const;

    // Actions
    Q_INVOKABLE void save();
    Q_INVOKABLE void cancel();
    Q_INVOKABLE void resetDefaults();
    Q_INVOKABLE void fetchOsArchLists();

signals:
    void repoUrlChanged();
    void osNameChanged();
    void archNameChanged();
    void osListChanged();
    void archListChanged();
    void chunkSizeChanged();
    void isDirtyChanged();
    void urlErrorChanged();
    void saved();
    void cancelled();

private:
    bool validateUrl(const QString& url) const;
    void loadFromSettings();
    void checkDirty();

    SettingsManager* m_settings;
    ApiClient* m_apiClient;

    // Editing copies (not committed until save)
    QString m_repoUrl;
    QString m_osName;
    QString m_archName;
    int m_chunkSize;
    bool m_isDirty = false;
    QString m_urlError;

    QStringList m_osList;
    QStringList m_archList;
};

} // namespace Hypernucleus
