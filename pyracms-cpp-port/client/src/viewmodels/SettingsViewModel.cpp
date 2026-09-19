#include "viewmodels/SettingsViewModel.h"
#include "domain/ServerUrl.h"
#include "services/SettingsManager.h"
#include "services/ApiClient.h"

#include <QUrl>

namespace Hypernucleus {

SettingsViewModel::SettingsViewModel(SettingsManager* settings,
                                     ApiClient* apiClient, QObject* parent)
    : SettingsEditBase(parent), m_settings(settings), m_apiClient(apiClient),
      m_osList({"linux", "macos", "windows"}),
      m_archList({"x86_64", "arm64", "x86"})
{
    loadFromSettings();
    connect(this, &SettingsEditBase::edited, this,
            &SettingsViewModel::onEdited);
    // Keep the editing copy in step when something else (login, deep link)
    // changes the site slug.
    connect(m_settings, &SettingsManager::tenantSlugChanged, this, [this]() {
        if (!m_isDirty) loadFromSettings();
    });
}

void SettingsViewModel::onEdited()
{
    const QString error = ServerUrl::error(m_repoUrl);
    if (m_urlError != error) {
        m_urlError = error;
        emit urlErrorChanged();
    }
    checkDirty();
}

} // namespace Hypernucleus