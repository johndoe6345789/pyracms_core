#pragma once

#include "services/SettingsBase.h"

namespace Hypernucleus {

class SettingsManager : public SettingsBase {
    Q_OBJECT
    Q_PROPERTY(
        bool darkMode READ darkMode WRITE setDarkMode NOTIFY darkModeChanged)
    Q_PROPERTY(
        QString language READ language WRITE setLanguage NOTIFY languageChanged)
    Q_PROPERTY(QString tenantSlug READ tenantSlug WRITE setTenantSlug NOTIFY
                   tenantSlugChanged)
    Q_PROPERTY(QString installDir READ installDir WRITE setInstallDir NOTIFY
                   installDirChanged)
    Q_PROPERTY(QString pythonPath READ pythonPath WRITE setPythonPath NOTIFY
                   pythonPathChanged)
    Q_PROPERTY(bool preferPip READ preferPip WRITE setPreferPip NOTIFY
                   preferPipChanged)

public:
    explicit SettingsManager(QObject* parent = nullptr);

    bool darkMode() const;
    void setDarkMode(bool dark);
    QString language() const;
    void setLanguage(const QString& lang);
    // Tenant / site slug sent as "tenant" in the login/register body
    QString tenantSlug() const;
    void setTenantSlug(const QString& slug);
    // Folder for games/dependencies/logs; empty = platform default
    QString installDir() const;
    void setInstallDir(const QString& dir);
    // Python interpreter for python games and pip; empty = auto-detect
    QString pythonPath() const;
    void setPythonPath(const QString& path);
    // Look dependencies up on pip before the PyraCMS dependency API
    bool preferPip() const;
    void setPreferPip(bool on);

    Q_INVOKABLE void save();
    Q_INVOKABLE void load();
    Q_INVOKABLE void reset();

signals:
    void darkModeChanged();
    void languageChanged();
    void tenantSlugChanged();
    void installDirChanged();
    void pythonPathChanged();
    void preferPipChanged();

private:
    bool m_darkMode;
    QString m_language;
    QString m_tenantSlug;
    QString m_installDir;
    QString m_pythonPath;
    bool m_preferPip = true;
};

} // namespace Hypernucleus
