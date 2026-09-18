#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

#include <QCoreApplication>
#include <QDesktopServices>
#include <QFileInfo>
#include <QUrl>

namespace Hypernucleus {

void MainViewModel::wireGameSignals()
{
    connect(m_games, &GameManager::gameStarted, this,
            [this](const QString& name) {
                m_model->setTransient(name, GameStates::Running, 0.0,
                                      tr("Running"));
                refreshSelected();
            });
    connect(m_games, &GameManager::gameStopped, this,
            [this](const QString& name) {
                m_model->clearTransient(name);
                refreshSelected();
            });
    connect(m_games, &GameManager::gameError, this,
            [this](const QString& name, const QString& error) {
                m_model->setTransient(name, GameStates::LaunchFailed, 0.0,
                                      error);
                emit notify(tr("%1: %2").arg(name, error), true);
                refreshSelected();
            });
    connect(m_games, &GameManager::logChanged, this,
            &MainViewModel::gameLogChanged);
}

void MainViewModel::refresh()
{
    setCatalogError(QString());
    m_repo->refresh();
}

void MainViewModel::select(const QString& name)
{
    m_selectedName = name;
    m_selectedVersion.clear();
    if (!name.isEmpty()) m_repo->ensureDetail("game", name);
    refreshSelected();
}

void MainViewModel::selectVersion(const QString& version)
{
    m_selectedVersion = version;
    refreshSelected();
}

} // namespace Hypernucleus
