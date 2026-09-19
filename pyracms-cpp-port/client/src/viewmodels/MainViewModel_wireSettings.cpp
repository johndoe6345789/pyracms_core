#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

namespace Hypernucleus {

void MainViewModel::wireSettings()
{
    // A token belongs to one server + site: never send it to another.
    const auto signOutOfOldSite = [this]() {
        if (m_auth->isAuthenticated()) m_auth->logout();
    };
    connect(m_settings, &SettingsManager::repoUrlChanged, this, [=]() {
        m_api->setBaseUrl(m_settings->repoUrl());
        signOutOfOldSite(); // the token belongs to the previous server
        refresh();
    });
    connect(m_settings, &SettingsManager::tenantSlugChanged, this,
            [=]() {
                m_api->setTenant(m_settings->tenantSlug());
                signOutOfOldSite();
                refresh(); // another site = another catalog
            });
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
    connect(m_python, &PythonSetup::notice, this, &MainViewModel::notify);
    connect(m_auth, &AuthService::secureStorageUnavailable, this,
            [this](const QString& text) { emit notify(text, true); });
    connect(m_deepLinks, &DeepLinkController::rejected, this,
            [this](const QString& error) {
                emit notify(tr("Ignored link: %1").arg(error), true);
            });
    connect(m_deepLinks, &DeepLinkController::accepted, this,
            &MainViewModel::onLinkAccepted);
}

} // namespace Hypernucleus
