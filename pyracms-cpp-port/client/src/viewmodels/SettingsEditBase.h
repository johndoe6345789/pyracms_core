#pragma once

#include <QObject>
#include <QString>

namespace Hypernucleus {

// Buffered site/server/python fields; every edit emits edited().
class SettingsEditBase : public QObject {
    Q_OBJECT
    Q_PROPERTY(
        QString repoUrl READ repoUrl WRITE setRepoUrl NOTIFY repoUrlChanged)
    Q_PROPERTY(QString tenantSlug READ tenantSlug WRITE setTenantSlug NOTIFY
                   tenantSlugChanged)
    Q_PROPERTY(QString installDir READ installDir WRITE setInstallDir NOTIFY
                   installDirChanged)
    Q_PROPERTY(QString pythonPath READ pythonPath WRITE setPythonPath NOTIFY
                   pythonPathChanged)
    Q_PROPERTY(bool preferPip READ preferPip WRITE setPreferPip NOTIFY
                   preferPipChanged)

public:
    explicit SettingsEditBase(QObject* parent = nullptr);

    QString repoUrl() const { return m_repoUrl; }
    void setRepoUrl(const QString& url);
    QString tenantSlug() const { return m_tenantSlug; }
    void setTenantSlug(const QString& slug);
    QString installDir() const { return m_installDir; }
    void setInstallDir(const QString& dir);
    QString pythonPath() const { return m_pythonPath; }
    void setPythonPath(const QString& path);
    bool preferPip() const { return m_preferPip; }
    void setPreferPip(bool on);

signals:
    void repoUrlChanged();
    void tenantSlugChanged();
    void installDirChanged();
    void pythonPathChanged();
    void preferPipChanged();
    void edited();

protected:
    QString m_repoUrl;
    QString m_tenantSlug;
    QString m_installDir;
    QString m_pythonPath;
    bool m_preferPip = true;
};

} // namespace Hypernucleus
