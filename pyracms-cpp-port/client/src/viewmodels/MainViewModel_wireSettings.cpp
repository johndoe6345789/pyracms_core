#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

namespace Hypernucleus {

void MainViewModel::wireSettings()
{
    connect(m_settings, &SettingsManager::repoUrlChanged, this, [this]() {
        m_api->setBaseUrl(m_settings->repoUrl());
        refresh();
    });
    connect(m_settings, &SettingsManager::tenantSlugChanged, this,
            [this]() { m_api->setTenant(m_settings->tenantSlug()); });
    connect(m_settings, &SettingsManager::installDirChanged, this,
            [this]() { m_paths->setDataDir(m_settings->installDir()); });
    auto* self = this;
    const auto apply = [self]() { self->applyPlatformSettings(); };
    connect(m_settings, &SettingsBase::osNameChanged, this, apply);
    connect(m_settings, &SettingsBase::archNameChanged, this, apply);
    connect(m_settings, &SettingsManager::pythonPathChanged, this, apply);
    connect(m_settings, &SettingsManager::preferPipChanged, this, apply);
}

void MainViewModel::wireAuth()
{
    connect(m_auth, &AuthService::loginSuccess, this, [this]() {
        emit notify(tr("Signed in as %1").arg(m_auth->username()), false);
        refresh();
    });
    connect(m_auth, &AuthService::loggedOut, this, &MainViewModel::refresh);
    connect(m_deepLinks, &DeepLinkController::rejected, this,
            [this](const QString& error) {
                emit notify(tr("Ignored link: %1").arg(error), true);
            });
    connect(m_deepLinks, &DeepLinkController::accepted, this,
            &MainViewModel::onLinkAccepted);
}

} // namespace Hypernucleus
