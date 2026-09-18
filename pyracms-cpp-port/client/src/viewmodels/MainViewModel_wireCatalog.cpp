#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

namespace Hypernucleus {

void MainViewModel::wireCatalog()
{
    connect(m_repo, &EntryRepository::refreshingChanged, this,
            &MainViewModel::loadingChanged);
    connect(m_repo, &EntryRepository::refreshed, this, [this]() {
        setCatalogError(QString());
        emit categoriesChanged();
        if (!m_selectedName.isEmpty() && !m_repo->find(m_selectedName, "game"))
            select(QString());
        else
            refreshSelected();
        if (m_pendingLink.valid()) {
            const LinkAction link = m_pendingLink;
            m_pendingLink = LinkAction();
            runLinkAction(link);
        }
    });
    connect(m_repo, &EntryRepository::refreshFailed, this,
            [this](const QString& error) {
                setCatalogError(error);
                emit notify(tr("Could not load games: %1").arg(error), true);
            });
    connect(m_repo, &EntryRepository::entryChanged, this,
            [this](const QString& type, const QString& name) {
                if (type == "game" && name == m_selectedName)
                    refreshSelected();
                else if (type == "dep")
                    m_selectedTimer.start();
            });
    connect(m_model, &GameDepModel::categoriesChanged, this,
            &MainViewModel::categoriesChanged);
    connect(m_installer, &ModuleInstaller::installStateChanged, this,
            &MainViewModel::refreshSelected);
}

} // namespace Hypernucleus
