#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

#include <QCoreApplication>
#include <QDesktopServices>
#include <QFileInfo>
#include <QUrl>

namespace Hypernucleus {

void MainViewModel::cancelDownload(const QString& name)
{
    if (m_downloads->activeName() == name)
        m_downloads->cancelActive();
    else
        m_downloads->removeQueued(name);
}

void MainViewModel::toggleFavourite(const QString& name)
{
    m_model->toggleFavourite(name);
    refreshSelected();
}

void MainViewModel::openInstallFolder(const QString& name)
{
    const QString path = m_installer->installPath(name);
    if (!path.isEmpty()) QDesktopServices::openUrl(QUrl::fromLocalFile(path));
}

void MainViewModel::openLogFile(const QString& name)
{
    const QString path = m_games->logFilePath(name);
    if (QFileInfo::exists(path))
        QDesktopServices::openUrl(QUrl::fromLocalFile(path));
    else
        emit notify(tr("No log yet for %1").arg(name), false);
}

void MainViewModel::logout() { m_auth->logout(); }

void MainViewModel::registerUrlScheme()
{
    QString error;
    if (UrlSchemeRegistrar::registerForCurrentUser(
            QCoreApplication::applicationFilePath(), &error))
        emit notify(tr("pyracms:// links now open Hypernucleus"), false);
    else
        emit notify(error, true);
}

} // namespace Hypernucleus
