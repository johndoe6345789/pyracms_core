#include "models/DependencyModel.h"

namespace Hypernucleus {

DependencyModel::DependencyModel(QObject* parent) : QAbstractListModel(parent)
{
}

int DependencyModel::rowCount(const QModelIndex& parent) const
{
    return parent.isValid() ? 0 : m_entries.size();
}

QVariant DependencyModel::data(const QModelIndex& index, int role) const
{
    if (!index.isValid() || index.row() < 0 || index.row() >= m_entries.size())
        return {};

    const DependencyEntry& entry = m_entries.at(index.row());
    switch (role) {
    case Qt::DisplayRole:
        return entry.version.isEmpty()
                   ? entry.name
                   : QStringLiteral("%1 (%2)").arg(entry.name, entry.version);
    case DepNameRole:
        return entry.name;
    case DepVersionRole:
        return entry.version;
    case DepSourceRole:
        return entry.source;
    case DepInstalledRole:
        return entry.installed;
    default:
        return {};
    }
}

QHash<int, QByteArray> DependencyModel::roleNames() const
{
    return {
        {Qt::DisplayRole, "display"},    {DepNameRole, "name"},
        {DepVersionRole, "version"},     {DepSourceRole, "source"},
        {DepInstalledRole, "installed"},
    };
}

void DependencyModel::populate(const QList<DepRef>& dependencies,
                               const QMap<QString, QString>& installedVersions)
{
    beginResetModel();
    m_entries.clear();
    for (const DepRef& dep : dependencies) {
        DependencyEntry entry;
        entry.name = dep.name;
        entry.version = dep.version;
        entry.source = dep.source;
        entry.installed = installedVersions.contains(dep.name);
        m_entries.append(entry);
    }
    endResetModel();
    emit countChanged();
}

void DependencyModel::clear()
{
    beginResetModel();
    m_entries.clear();
    endResetModel();
    emit countChanged();
}

int DependencyModel::count() const { return m_entries.size(); }

} // namespace Hypernucleus
