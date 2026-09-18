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

void GameDepModel::fillRow(Row& row) const
{
    const GameEntry* e = m_repo->find(row.name, "game");
    if (!e) return;
    row.title = e->title();
    row.description = e->description;
    row.tags = e->tags;
    row.latest = e->latestVersion();
    row.coverRef =
        !e->hero.isEmpty()
            ? e->hero
            : (!e->screenshots.isEmpty() ? e->screenshots.first() : QString());
    row.accent = accentFor(e->name);
}

void GameDepModel::rebuild()
{
    if (!m_repo) return;
    beginResetModel();
    m_rows.clear();
    const QList<GameEntry> games = m_repo->entries("game");
    for (const GameEntry& g : games) {
        Row r;
        r.name = g.name;
        fillRow(r);
        m_rows.append(r);
    }
    std::sort(m_rows.begin(), m_rows.end(), [](const Row& a, const Row& b) {
        return a.title.compare(b.title, Qt::CaseInsensitive) < 0;
    });
    endResetModel();
    emit countChanged();
    emit categoriesChanged();
}

int GameDepModel::rowOf(const QString& name) const
{
    for (int i = 0; i < m_rows.size(); ++i)
        if (m_rows.at(i).name == name) return i;
    return -1;
}

void GameDepModel::emitRow(int row, const QList<int>& roles)
{
    if (row < 0 || row >= m_rows.size()) return;
    emit dataChanged(index(row), index(row), roles);
}

} // namespace Hypernucleus
