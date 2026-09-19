#include "services/SettingsManager.h"

#include <QSettings>
#include <QSysInfo>

namespace Hypernucleus {

QString SettingsManager::tenantSlug() const { return m_tenantSlug; }

void SettingsManager::setTenantSlug(const QString& slug)
{
    const QString s = slug.trimmed();
    if (m_tenantSlug == s) return;
    m_tenantSlug = s;
    emit tenantSlugChanged();
}

QString SettingsManager::installDir() const { return m_installDir; }

void SettingsManager::setInstallDir(const QString& dir)
{
    const QString d = dir.trimmed();
    if (m_installDir == d) return;
    m_installDir = d;
    emit installDirChanged();
}

QString SettingsManager::pythonPath() const { return m_pythonPath; }

void SettingsManager::setPythonPath(const QString& path)
{
    const QString p = path.trimmed();
    if (m_pythonPath == p) return;
    m_pythonPath = p;
    emit pythonPathChanged();
}

bool SettingsManager::preferPip() const { return m_preferPip; }

void SettingsManager::setPreferPip(bool on)
{
    if (m_preferPip == on) return;
    m_preferPip = on;
    emit preferPipChanged();
}

QString SettingsManager::language() const { return m_language; }

void SettingsManager::setLanguage(const QString& lang)
{
    if (m_language == lang) return;
    m_language = lang;
    emit languageChanged();
}

void SettingsManager::save()
{
    QSettings settings;
    settings.beginGroup("settings");
    settings.setValue("repoUrl", m_repoUrl);
    settings.setValue("osName", m_osName);
    settings.setValue("archName", m_archName);
    settings.setValue("chunkSize", m_chunkSize);
    settings.setValue("windowGeometry", m_windowGeometry);
    settings.setValue("darkMode", m_darkMode);
    settings.setValue("language", m_language);
    settings.setValue("tenantSlug", m_tenantSlug);
    settings.setValue("installDir", m_installDir);
    settings.setValue("pythonPath", m_pythonPath);
    settings.setValue("preferPip", m_preferPip);
    settings.setValue("recentServers", m_recentServers);
    settings.endGroup();
    settings.sync();
}

} // namespace Hypernucleus
