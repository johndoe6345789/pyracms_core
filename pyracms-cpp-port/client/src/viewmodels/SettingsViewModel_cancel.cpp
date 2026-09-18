#include "viewmodels/SettingsViewModel.h"
#include "services/SettingsManager.h"
#include "services/ApiClient.h"

#include <QUrl>

namespace Hypernucleus {

void SettingsViewModel::cancel()
{
    loadFromSettings();
    m_isDirty = false;
    emit isDirtyChanged();
    emit cancelled();
}

void SettingsViewModel::resetDefaults()
{
    m_settings->reset();
    loadFromSettings();
    m_isDirty = false;
    emit isDirtyChanged();
}

void SettingsViewModel::fetchOsArchLists()
{
    m_osList = {"linux", "macos", "windows"};
    m_archList = {"x86_64", "arm64", "x86"};
    emit osListChanged();
    emit archListChanged();
}

bool SettingsViewModel::validateUrl(const QString& url) const
{
    const QUrl parsed(url);
    return parsed.isValid() &&
           (parsed.scheme() == "http" || parsed.scheme() == "https") &&
           !parsed.host().isEmpty();
}

void SettingsViewModel::loadFromSettings()
{
    m_repoUrl = m_settings->repoUrl();
    m_tenantSlug = m_settings->tenantSlug();
    m_installDir = m_settings->installDir();
    m_pythonPath = m_settings->pythonPath();
    m_preferPip = m_settings->preferPip();
    m_osName = m_settings->osName();
    m_archName = m_settings->archName();
    m_chunkSize = m_settings->chunkSize();
    m_urlError.clear();

    emit repoUrlChanged();
    emit tenantSlugChanged();
    emit installDirChanged();
    emit pythonPathChanged();
    emit preferPipChanged();
    emit osNameChanged();
    emit archNameChanged();
    emit chunkSizeChanged();
    emit urlErrorChanged();
}

} // namespace Hypernucleus
