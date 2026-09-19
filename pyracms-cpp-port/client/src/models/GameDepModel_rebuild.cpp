#include "models/GameDepModel.h"
#include "services/EntryRepository.h"

#include <algorithm>

namespace Hypernucleus {

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

void GameDepModel::setPlatform(const QString& os, const QString& arch)
{
    if (m_os == os && m_arch == arch) return;
    m_os = os;
    m_arch = arch;
    rebuild();
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
