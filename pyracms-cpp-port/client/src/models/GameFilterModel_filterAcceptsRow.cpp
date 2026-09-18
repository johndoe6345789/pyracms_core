#include "models/GameFilterModel.h"
#include "models/Constants.h"
#include "models/GameDepModel.h"

namespace Hypernucleus {

bool GameFilterModel::filterAcceptsRow(int sourceRow,
                                       const QModelIndex& parent) const
{
    const QAbstractItemModel* src = sourceModel();
    if (!src) return false;
    const QModelIndex idx = src->index(sourceRow, 0, parent);

    if (m_filter == GameStates::FilterInstalled &&
        !idx.data(GameDepModel::InstalledRole).toBool())
        return false;
    if (m_filter == GameStates::FilterUpdates &&
        !idx.data(GameDepModel::UpdateAvailableRole).toBool())
        return false;

    if (!m_category.isEmpty()) {
        if (m_category == QLatin1String(CATEGORY_FAVOURITES)) {
            if (!idx.data(GameDepModel::FavouriteRole).toBool()) return false;
        } else if (!idx.data(GameDepModel::TagsRole)
                        .toStringList()
                        .contains(m_category)) {
            return false;
        }
    }

    const QString needle = m_search.trimmed();
    if (!needle.isEmpty()) {
        const bool hit = idx.data(GameDepModel::TitleRole)
                             .toString()
                             .contains(needle, Qt::CaseInsensitive) ||
                         idx.data(GameDepModel::NameRole)
                             .toString()
                             .contains(needle, Qt::CaseInsensitive) ||
                         idx.data(GameDepModel::TagsRole)
                             .toStringList()
                             .join(' ')
                             .contains(needle, Qt::CaseInsensitive);
        if (!hit) return false;
    }
    return true;
}

bool GameFilterModel::lessThan(const QModelIndex& left,
                               const QModelIndex& right) const
{
    const bool li = left.data(GameDepModel::InstalledRole).toBool();
    const bool ri = right.data(GameDepModel::InstalledRole).toBool();
    if (li != ri) return li; // installed first
    return left.data(GameDepModel::TitleRole)
               .toString()
               .compare(right.data(GameDepModel::TitleRole).toString(),
                        Qt::CaseInsensitive) < 0;
}

int GameFilterModel::indexOfName(const QString& name) const
{
    for (int i = 0; i < rowCount(); ++i)
        if (index(i, 0).data(GameDepModel::NameRole).toString() == name)
            return i;
    return -1;
}

QString GameFilterModel::nameAt(int row) const
{
    if (row < 0 || row >= rowCount()) return {};
    return index(row, 0).data(GameDepModel::NameRole).toString();
}

} // namespace Hypernucleus
