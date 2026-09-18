#include "viewmodels/SettingsViewModel.h"
#include "services/SettingsManager.h"
#include "services/ApiClient.h"

#include <QUrl>

namespace Hypernucleus {

void SettingsViewModel::checkDirty()
{
    const bool dirty = m_repoUrl != m_settings->repoUrl() ||
                       m_tenantSlug != m_settings->tenantSlug() ||
                       m_installDir != m_settings->installDir() ||
                       m_pythonPath != m_settings->pythonPath() ||
                       m_preferPip != m_settings->preferPip() ||
                       m_osName != m_settings->osName() ||
                       m_archName != m_settings->archName() ||
                       m_chunkSize != m_settings->chunkSize();
    if (m_isDirty != dirty) {
        m_isDirty = dirty;
        emit isDirtyChanged();
    }
}

} // namespace Hypernucleus
