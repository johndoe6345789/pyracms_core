#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

#include <QCoreApplication>
#include <QDesktopServices>
#include <QFileInfo>
#include <QUrl>

namespace Hypernucleus {

void MainViewModel::dispatch(const QString& name, const QString& kind,
                             const QString& version)
{
    if (kind == "install" || kind == "update")
        install(name, version);
    else if (kind == "play")
        launch(name);
    else if (kind == "stop")
        stop();
    else if (kind == "cancel")
        cancelDownload(name);
}

void MainViewModel::install(const QString& name, const QString& version)
{
    if (!m_repo->find(name, "game")) {
        emit notify(tr("Unknown game: %1").arg(name), true);
        return;
    }
    m_downloads->enqueue(name, version);
}

void MainViewModel::uninstall(const QString& name)
{
    if (m_games->isRunning() && m_games->currentGame() == name)
        m_games->stopGame();
    m_installer->uninstall(name, m_installer->installedVersion(name), "game");
}

void MainViewModel::launch(const QString& name)
{
    if (!m_installer->isInstalled(name)) {
        emit notify(tr("%1 is not installed").arg(name), true);
        return;
    }
    m_model->setTransient(name, GameStates::Launching, 0.0, tr("Launching"));
    refreshSelected();
    m_games->launchGame(name);
}

void MainViewModel::stop() { m_games->stopGame(); }

} // namespace Hypernucleus
