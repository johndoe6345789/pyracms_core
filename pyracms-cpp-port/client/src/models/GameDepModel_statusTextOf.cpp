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

QString GameDepModel::statusTextOf(const QString& name) const
{
    return m_transient.value(name).text;
}

void GameDepModel::setTransient(const QString& name, int state, double progress,
                                const QString& text)
{
    m_transient.insert(name, Transient{state, progress, text});
    emitRow(rowOf(name), {StateRole, ProgressRole, StatusTextRole});
}

void GameDepModel::clearTransient(const QString& name)
{
    if (m_transient.remove(name) > 0)
        emitRow(rowOf(name), {StateRole, ProgressRole, StatusTextRole});
}

bool GameDepModel::isFavourite(const QString& name) const
{
    return m_favourites.contains(name);
}

void GameDepModel::toggleFavourite(const QString& name)
{
    if (!m_favourites.removeOne(name)) m_favourites.append(name);
    QSettings s;
    s.setValue("library/favourites", m_favourites);
    emitRow(rowOf(name)); // all roles: the category filter depends on it
}

} // namespace Hypernucleus
