#pragma once

#include <QObject>
#include <QStringList>
#include <QString>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

class SettingsManager;
class ApiClient;

// Editable copy of the settings; nothing is applied until save().
class SettingsViewModel : public QObject {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Owned by MainViewModel")
    Q_PROPERTY(QString repoUrl READ repoUrl WRITE setRepoUrl NOTIFY repoUrlChanged)
    Q_PROPERTY(QString tenantSlug READ tenantSlug WRITE setTenantSlug NOTIFY tenantSlugChanged)
    Q_PROPERTY(QString installDir READ installDir WRITE setInstallDir NOTIFY installDirChanged)
    Q_PROPERTY(QString pythonPath READ pythonPath WRITE setPythonPath NOTIFY pythonPathChanged)
    Q_PROPERTY(bool preferPip READ preferPip WRITE setPreferPip NOTIFY preferPipChanged)
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

    QString repoUrl() const;
    void setRepoUrl(const QString& url);
    QString tenantSlug() const;
    void setTenantSlug(const QString& slug);
    QString installDir() const;
    void setInstallDir(const QString& dir);
    QString pythonPath() const;
    void setPythonPath(const QString& path);
    bool preferPip() const;
    void setPreferPip(bool on);
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

    Q_INVOKABLE void save();
    Q_INVOKABLE void cancel();
    Q_INVOKABLE void resetDefaults();
    Q_INVOKABLE void fetchOsArchLists();

signals:
    void repoUrlChanged();
    void tenantSlugChanged();
    void installDirChanged();
    void pythonPathChanged();
    void preferPipChanged();
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

    QString m_repoUrl;
    QString m_tenantSlug;
    QString m_installDir;
    QString m_pythonPath;
    bool m_preferPip = true;
    QString m_osName;
    QString m_archName;
    int m_chunkSize = 8192;
    bool m_isDirty = false;
    QString m_urlError;

    QStringList m_osList;
    QStringList m_archList;
};

} // namespace Hypernucleus
