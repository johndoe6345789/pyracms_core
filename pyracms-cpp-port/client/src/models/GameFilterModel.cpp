#include "models/GameFilterModel.h"
#include "models/Constants.h"
#include "models/GameDepModel.h"

namespace Hypernucleus {

GameFilterModel::GameFilterModel(QObject* parent)
    : QSortFilterProxyModel(parent)
{
    setDynamicSortFilter(true);
    connect(this, &QAbstractItemModel::rowsInserted, this,
            &GameFilterModel::countChanged);
    connect(this, &QAbstractItemModel::rowsRemoved, this,
            &GameFilterModel::countChanged);
    connect(this, &QAbstractItemModel::modelReset, this,
            &GameFilterModel::countChanged);
    connect(this, &QAbstractItemModel::layoutChanged, this,
            &GameFilterModel::countChanged);
}

void GameFilterModel::setSourceModel(QAbstractItemModel* model)
{
    QSortFilterProxyModel::setSourceModel(model);
    sort(0);
}

void GameFilterModel::setSearchText(const QString& text)
{
    if (m_search == text) return;
    m_search = text;
    invalidateFilter();
    emit searchTextChanged();
}

void GameFilterModel::setFilter(int filter)
{
    if (m_filter == filter) return;
    m_filter = filter;
    invalidateFilter();
    emit filterChanged();
}

void GameFilterModel::setCategory(const QString& category)
{
    if (m_category == category) return;
    m_category = category;
    invalidateFilter();
    emit categoryChanged();
}

} // namespace Hypernucleus
