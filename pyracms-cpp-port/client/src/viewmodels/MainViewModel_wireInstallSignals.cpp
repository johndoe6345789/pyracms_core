#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

#include <QCoreApplication>
#include <QDesktopServices>
#include <QFileInfo>
#include <QUrl>

namespace Hypernucleus {

void MainViewModel::wireInstallSignals()
{
    connect(m_downloads, &DownloadCenter::gameStateChanged, this,
            [this](const QString& name, int state, double progress,
                   const QString& text) {
                m_model->setTransient(name, state, progress, text);
                if (name == m_selectedName && !m_selectedTimer.isActive())
                    m_selectedTimer.start();
            });
    connect(m_downloads, &DownloadCenter::gameFinished, this,
            [this](const QString& name, const QString& version) {
                m_model->clearTransient(name);
                emit notify(tr("%1 %2 installed").arg(name, version), false);
                refreshSelected();
                if (m_launchAfterInstall == name) {
                    m_launchAfterInstall.clear();
                    launch(name);
                }
            });
    connect(
        m_downloads, &DownloadCenter::gameFailed, this,
        [this](const QString& name, const QString& error) {
            m_model->setTransient(name, GameStates::InstallFailed, 0.0, error);
            m_launchAfterInstall.clear();
            emit notify(tr("Installing %1 failed: %2").arg(name, error), true);
            refreshSelected();
        });
    connect(m_downloads, &DownloadCenter::gameCancelled, this,
            [this](const QString& name) {
                m_model->clearTransient(name);
                if (m_launchAfterInstall == name) m_launchAfterInstall.clear();
                refreshSelected();
            });
    connect(m_installer, &ModuleInstaller::uninstallComplete, this,
            [this](const QString& name) {
                m_model->clearTransient(name);
                emit notify(tr("%1 uninstalled").arg(name), false);
            });
    connect(m_installer, &ModuleInstaller::uninstallFailed, this,
            [this](const QString& name, const QString& error) {
                emit notify(tr("Could not uninstall %1: %2").arg(name, error),
                            true);
            });
}

} // namespace Hypernucleus
