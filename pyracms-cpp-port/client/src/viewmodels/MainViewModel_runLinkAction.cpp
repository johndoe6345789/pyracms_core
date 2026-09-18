#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

#include <QCoreApplication>
#include <QDesktopServices>
#include <QFileInfo>
#include <QUrl>

namespace Hypernucleus {

void MainViewModel::runLinkAction(const LinkAction& link)
{
    if (!m_repo->find(link.name, "game")) {
        emit notify(tr("'%1' was not found on this site").arg(link.name), true);
        return;
    }
    select(link.name);
    emit showGame(link.name);
    if (link.action == "install") {
        install(link.name, QString());
    } else if (m_installer->isInstalled(link.name)) {
        launch(link.name);
    } else {
        m_launchAfterInstall = link.name;
        install(link.name, QString());
    }
}

} // namespace Hypernucleus
