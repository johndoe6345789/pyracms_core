#include "models/DependencyModel.h"
#include "models/Constants.h"

#include <QJsonObject>

namespace Hypernucleus {

DependencyModel::DependencyModel(QObject* parent)
    : QAbstractListModel(parent)
{
}

int DependencyModel::rowCount(const QModelIndex& parent) const
{
    if (parent.isValid())
        return 0;
    return m_entries.size();
}

QVariant DependencyModel::data(const QModelIndex& index, int role) const
{
    if (!index.isValid() || index.row() < 0 || index.row() >= m_entries.size())
        return {};

    const auto& entry = m_entries.at(index.row());

    switch (role) {
    case Qt::DisplayRole:
        return QString("%1 (%2)").arg(entry.name, entry.version);
    case DepNameRole:
        return entry.name;
    case DepVersionRole:
        return entry.version;
    case DepInstalledRole:
        return entry.installed;
    default:
        return {};
    }
}

QHash<int, QByteArray> DependencyModel::roleNames() const
{
    return {
        { Qt::DisplayRole, "display" },
        { DepNameRole, "name" },
        { DepVersionRole, "version" },
        { DepInstalledRole, "installed" },
    };
}

void DependencyModel::populate(const QJsonArray& dependencies,
                                const QMap<QString, QString>& installedVersions)
{
    beginResetModel();
    m_entries.clear();

    for (const auto& depVal : dependencies) {
        QJsonObject depObj = depVal.toObject();
        DependencyEntry entry;
        entry.name = depObj.value("name").toString();
        entry.version = depObj.value("version").toString();
        entry.installed = installedVersions.contains(entry.name);
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

int DependencyModel::count() const
{
    return m_entries.size();
}

} // namespace Hypernucleus
