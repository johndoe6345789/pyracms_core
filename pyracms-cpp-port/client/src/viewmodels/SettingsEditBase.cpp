#include "viewmodels/SettingsEditBase.h"

namespace Hypernucleus {

SettingsEditBase::SettingsEditBase(QObject* parent) : QObject(parent) {}

void SettingsEditBase::setRepoUrl(const QString& url)
{
    if (m_repoUrl == url) return;
    m_repoUrl = url;
    emit repoUrlChanged();
    emit edited();
}

void SettingsEditBase::setTenantSlug(const QString& slug)
{
    if (m_tenantSlug == slug) return;
    m_tenantSlug = slug;
    emit tenantSlugChanged();
    emit edited();
}

void SettingsEditBase::setInstallDir(const QString& dir)
{
    if (m_installDir == dir) return;
    m_installDir = dir;
    emit installDirChanged();
    emit edited();
}

void SettingsEditBase::setPythonPath(const QString& path)
{
    if (m_pythonPath == path) return;
    m_pythonPath = path;
    emit pythonPathChanged();
    emit edited();
}

void SettingsEditBase::setPreferPip(bool on)
{
    if (m_preferPip == on) return;
    m_preferPip = on;
    emit preferPipChanged();
    emit edited();
}

} // namespace Hypernucleus
