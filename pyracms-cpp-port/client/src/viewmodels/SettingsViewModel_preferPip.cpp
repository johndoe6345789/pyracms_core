#include "viewmodels/SettingsViewModel.h"
#include "services/SettingsManager.h"
#include "services/ApiClient.h"

#include <QUrl>

namespace Hypernucleus {


QString SettingsViewModel::osName() const { return m_osName; }
void SettingsViewModel::setOsName(const QString& name)
{
    if (m_osName == name) return;
    m_osName = name;
    emit osNameChanged();
    checkDirty();
}

QString SettingsViewModel::archName() const { return m_archName; }
void SettingsViewModel::setArchName(const QString& name)
{
    if (m_archName == name) return;
    m_archName = name;
    emit archNameChanged();
    checkDirty();
}

QStringList SettingsViewModel::osList() const { return m_osList; }
QStringList SettingsViewModel::archList() const { return m_archList; }

int SettingsViewModel::chunkSize() const { return m_chunkSize; }
void SettingsViewModel::setChunkSize(int size)
{
    if (m_chunkSize == size) return;
    m_chunkSize = size;
    emit chunkSizeChanged();
    checkDirty();
}

bool SettingsViewModel::isDirty() const { return m_isDirty; }
QString SettingsViewModel::urlError() const { return m_urlError; }

void SettingsViewModel::save()
{
    if (!m_urlError.isEmpty()) return;

    // The tenant slug applies to the API client through MainViewModel, which
    // listens to SettingsManager changes.
    m_settings->setRepoUrl(m_repoUrl);
    m_settings->setTenantSlug(m_tenantSlug);
    m_settings->setInstallDir(m_installDir);
    m_settings->setPythonPath(m_pythonPath);
    m_settings->setPreferPip(m_preferPip);
    m_settings->setOsName(m_osName);
    m_settings->setArchName(m_archName);
    m_settings->setChunkSize(m_chunkSize);
    m_settings->save();

    m_isDirty = false;
    emit isDirtyChanged();
    emit saved();
}

} // namespace Hypernucleus
