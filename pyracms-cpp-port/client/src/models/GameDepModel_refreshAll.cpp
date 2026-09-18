#include "models/GameDepModel.h"
#include "models/Constants.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"
#include "services/ModuleInstaller.h"
#include "domain/MediaRef.h"
#include "domain/VersionCompare.h"
#include "viewmodels/SelectedGameView.h"

#include <QSettings>
#include <algorithm>

namespace Hypernucleus {

namespace {

QColor accentFor(const QString& name)
{
    uint h = 0;
    for (const QChar c : name)
        h = (h * 31 + c.unicode()) % 360;
    return QColor::fromHsl(static_cast<int>(h), 110, 70);
}

} // namespace

void GameDepModel::refreshAll()
{
    if (m_rows.isEmpty()) return;
    emit dataChanged(index(0), index(m_rows.size() - 1));
}

void GameDepModel::refreshRow(const QString& name)
{
    const int i = rowOf(name);
    if (i < 0) return;
    fillRow(m_rows[i]);
    emitRow(i);
    emit categoriesChanged();
}

bool GameDepModel::updateAvailable(const Row& row) const
{
    if (!m_installer || row.latest.isEmpty()) return false;
    const QString have = m_installer->installedVersion(row.name);
    return !have.isEmpty() && VersionCompare::compare(have, row.latest) < 0;
}

int GameDepModel::computeState(const Row& row) const
{
    const auto t = m_transient.constFind(row.name);
    if (t != m_transient.constEnd()) return t->state;
    if (!m_installer || !m_installer->isInstalled(row.name))
        return GameStates::NotInstalled;
    return updateAvailable(row) ? GameStates::UpdateAvailable
                                : GameStates::Installed;
}

int GameDepModel::stateOf(const QString& name) const
{
    const int i = rowOf(name);
    return i < 0 ? static_cast<int>(GameStates::NotInstalled)
                 : computeState(m_rows.at(i));
}

double GameDepModel::progressOf(const QString& name) const
{
    return m_transient.value(name).progress;
}

QColor GameDepModel::accentOf(const QString& name) const
{
    return accentFor(name);
}

} // namespace Hypernucleus
