#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

namespace Hypernucleus {

MainViewModel* MainViewModel::s_instance = nullptr;

void MainViewModel::setInstance(MainViewModel* instance)
{
    s_instance = instance;
}

MainViewModel* MainViewModel::create(QQmlEngine* engine, QJSEngine*)
{
    if (!s_instance) s_instance = new MainViewModel(engine);
    QJSEngine::setObjectOwnership(s_instance, QJSEngine::CppOwnership);
    return s_instance;
}

MainViewModel::MainViewModel(QObject* parent) : MainViewModelBase(parent)
{
    m_api->setBaseUrl(m_settings->repoUrl());
    m_api->setTenant(m_settings->tenantSlug());
    applyPlatformSettings();

    m_model->attach(m_repo, m_installer, m_api);
    m_library->setSourceModel(m_model);
    m_store->setSourceModel(m_model);

    m_selectedTimer.setSingleShot(true);
    m_selectedTimer.setInterval(60);
    connect(&m_selectedTimer, &QTimer::timeout, this,
            &MainViewModel::refreshSelected);

    wireSettings();
    wireCatalog();
    wireAuth();
    wireInstallSignals();
    wireGameSignals();

    m_auth->restoreSession();
    refresh();
}

MainViewModel::~MainViewModel() = default;

void MainViewModel::setCatalogError(const QString& error)
{
    if (m_catalogError == error) return;
    m_catalogError = error;
    emit catalogErrorChanged();
}

void MainViewModel::applyPlatformSettings()
{
    m_planner->setPlatform(m_settings->osName(), m_settings->archName());
    m_planner->setPreferPip(m_settings->preferPip());
    m_games->setPlatform(m_settings->osName());
    m_games->setPythonPath(m_settings->pythonPath());
    m_pip->setPythonPath(m_settings->pythonPath());
}

} // namespace Hypernucleus
