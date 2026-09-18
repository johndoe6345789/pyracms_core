#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

#include <QCoreApplication>
#include <QDesktopServices>
#include <QFileInfo>
#include <QUrl>

namespace Hypernucleus {

// --- pyracms:// links ------------------------------------------------------

void MainViewModel::handleUrl(const QString& url)
{
    emit raiseWindow();
    if (!m_deepLinks->setUrl(url, m_settings->tenantSlug())) return;
    const DeepLink link = m_deepLinks->link();
    // Starting an installed game from the same site is harmless; installing
    // something or switching sites always asks first.
    if (link.action == DeepLink::Action::Launch &&
        !m_deepLinks->siteMismatch() && !m_settings->tenantSlug().isEmpty() &&
        m_installer->isInstalled(link.name)) {
        m_deepLinks->accept();
    }
}

void MainViewModel::onLinkAccepted(const QString& action, const QString& slug,
                                   const QString& name)
{
    const LinkAction link{action, name};
    if (slug != m_settings->tenantSlug()) {
        // Accounts and catalogs are per site: switch, then continue.
        m_pendingLink = link;
        m_settings->setTenantSlug(slug); // also updates the API client
        m_settings->save();
        if (m_auth->isAuthenticated())
            m_auth->logout(); // loggedOut -> refresh()
        else
            refresh();
        return;
    }
    if (!m_repo->isLoaded()) {
        m_pendingLink = link;
        return; // refreshed() continues
    }
    runLinkAction(link);
}

} // namespace Hypernucleus
