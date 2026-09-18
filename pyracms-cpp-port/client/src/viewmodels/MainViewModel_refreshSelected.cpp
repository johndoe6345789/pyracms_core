#include "viewmodels/MainViewModel.h"
#include "viewmodels/MainViewModelDeps.h"

#include <QCoreApplication>
#include <QDesktopServices>
#include <QFileInfo>
#include <QUrl>

namespace Hypernucleus {

void MainViewModel::refreshSelected()
{
    const GameEntry* e = m_selectedName.isEmpty()
                             ? nullptr
                             : m_repo->find(m_selectedName, "game");
    if (!e) {
        m_selected.clear();
        m_deps->clear();
        emit selectedChanged();
        return;
    }
    SelectedGameView::Input in;
    in.entry = e;
    in.record = m_installer->record(e->name);
    in.state = m_model->stateOf(e->name);
    in.progress = m_model->progressOf(e->name);
    in.statusText = m_model->statusTextOf(e->name);
    in.selectedVersion = m_selectedVersion;
    in.accent = m_model->accentOf(e->name);
    in.mediaUrl = [this](const QString& path) {
        return m_api->resolveUrl(path).toString();
    };
    m_selected = SelectedGameView::build(in);
    m_selected["favourite"] = m_model->isFavourite(e->name);
    m_deps->populate(e->dependencies, m_installer->installedVersions());
    emit selectedChanged();
}

void MainViewModel::primaryAction()
{
    if (m_selectedName.isEmpty()) return;
    const QString kind = m_selected.value("primaryKind").toString();
    dispatch(m_selectedName, kind, m_selectedVersion);
}

void MainViewModel::primaryActionFor(const QString& name)
{
    const SelectedGameView::Primary p = SelectedGameView::primaryFor(
        m_model->stateOf(name), m_model->progressOf(name),
        m_installer->installedVersion(name), QString());
    dispatch(name, p.kind, QString());
}

} // namespace Hypernucleus
