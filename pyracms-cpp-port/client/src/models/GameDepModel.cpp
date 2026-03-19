#include "models/GameDepModel.h"
#include "models/Constants.h"

#include <QJsonDocument>

namespace Hypernucleus {

GameDepModel::GameDepModel(QObject* parent)
    : QAbstractItemModel(parent)
    , m_rootItem(new GameDepItem)
{
    m_rootItem->name = "Root";
}

GameDepModel::~GameDepModel()
{
    delete m_rootItem;
}

QModelIndex GameDepModel::index(int row, int column, const QModelIndex& parent) const
{
    if (!hasIndex(row, column, parent))
        return {};

    GameDepItem* parentItem = parent.isValid()
        ? static_cast<GameDepItem*>(parent.internalPointer())
        : m_rootItem;

    if (row >= 0 && row < parentItem->children.size()) {
        return createIndex(row, column, parentItem->children.at(row));
    }
    return {};
}

QModelIndex GameDepModel::parent(const QModelIndex& child) const
{
    if (!child.isValid())
        return {};

    auto* childItem = static_cast<GameDepItem*>(child.internalPointer());
    GameDepItem* parentItem = childItem->parent;

    if (!parentItem || parentItem == m_rootItem)
        return {};

    return createIndex(parentItem->row, 0, parentItem);
}

int GameDepModel::rowCount(const QModelIndex& parent) const
{
    if (parent.column() > 0)
        return 0;

    GameDepItem* parentItem = parent.isValid()
        ? static_cast<GameDepItem*>(parent.internalPointer())
        : m_rootItem;

    return parentItem->children.size();
}

int GameDepModel::columnCount(const QModelIndex& /*parent*/) const
{
    return 1;
}

QVariant GameDepModel::data(const QModelIndex& index, int role) const
{
    if (!index.isValid())
        return {};

    auto* item = static_cast<GameDepItem*>(index.internalPointer());

    switch (role) {
    case Qt::DisplayRole:
    case DisplayNameRole:
        return item->displayName.isEmpty() ? item->name : item->displayName;
    case NameRole:
        return item->name;
    case DescriptionRole:
        return item->description;
    case TypeRole:
        return item->type;
    case InstalledRole:
        return item->installed;
    case VersionRole:
        return item->installedVersion;
    case CategoryRole:
        return (item->parent == m_rootItem);
    case UuidRole:
        return item->uuid;
    case PicturesRole:
        return QVariant::fromValue(item->pictures);
    case DependenciesRole:
        return QVariant::fromValue(item->dependencies);
    case RevisionsRole:
        return QVariant::fromValue(item->revisions);
    case ItemTypeRole:
        return item->type == "game" ? static_cast<int>(ItemType::Game)
                                    : static_cast<int>(ItemType::Dep);
    case InstalledVersionRole:
        return item->installedVersion;
    default:
        return {};
    }
}

QHash<int, QByteArray> GameDepModel::roleNames() const
{
    return {
        { Qt::DisplayRole, "display" },
        { NameRole, "name" },
        { DisplayNameRole, "displayName" },
        { DescriptionRole, "description" },
        { TypeRole, "type" },
        { InstalledRole, "installed" },
        { VersionRole, "version" },
        { CategoryRole, "isCategory" },
        { UuidRole, "uuid" },
        { PicturesRole, "pictures" },
        { DependenciesRole, "dependencies" },
        { RevisionsRole, "revisions" },
        { ItemTypeRole, "itemType" },
        { InstalledVersionRole, "installedVersion" },
    };
}

void GameDepModel::populate(const QJsonObject& catalog)
{
    m_fullCatalog = catalog;
    rebuildFiltered();
}

void GameDepModel::markInstalled(const QString& name, const QString& version)
{
    m_installedMap[name] = true;
    m_installedVersions[name] = version;
    rebuildFiltered();
}

void GameDepModel::markUninstalled(const QString& name)
{
    m_installedMap.remove(name);
    m_installedVersions.remove(name);
    rebuildFiltered();
}

QJsonObject GameDepModel::itemData(const QModelIndex& index) const
{
    if (!index.isValid())
        return {};

    auto* item = static_cast<GameDepItem*>(index.internalPointer());
    QJsonObject obj;
    obj["name"] = item->name;
    obj["displayName"] = item->displayName;
    obj["description"] = item->description;
    obj["type"] = item->type;
    obj["installed"] = item->installed;
    obj["installedVersion"] = item->installedVersion;
    obj["uuid"] = item->uuid;
    obj["pictures"] = item->pictures;
    obj["dependencies"] = item->dependencies;
    obj["revisions"] = item->revisions;
    return obj;
}

QString GameDepModel::searchText() const
{
    return m_searchText;
}

void GameDepModel::setSearchText(const QString& text)
{
    if (m_searchText == text)
        return;
    m_searchText = text;
    emit searchTextChanged();
    rebuildFiltered();
}

int GameDepModel::totalCount() const
{
    int count = 0;
    for (auto* cat : m_rootItem->children) {
        count += cat->children.size();
    }
    return count;
}

void GameDepModel::clear()
{
    beginResetModel();
    qDeleteAll(m_rootItem->children);
    m_rootItem->children.clear();
    endResetModel();
}

void GameDepModel::rebuildFiltered()
{
    beginResetModel();
    qDeleteAll(m_rootItem->children);
    m_rootItem->children.clear();

    auto* catInstalledGames = createCategoryItem(CAT_INSTALLED_GAMES);
    auto* catNotInstalledGames = createCategoryItem(CAT_NOT_INSTALLED_GAMES);
    auto* catInstalledDeps = createCategoryItem(CAT_INSTALLED_DEPS);
    auto* catNotInstalledDeps = createCategoryItem(CAT_NOT_INSTALLED_DEPS);

    auto processItems = [&](const QJsonObject& items, const QString& type) {
        for (auto it = items.begin(); it != items.end(); ++it) {
            const QString& name = it.key();
            const QJsonObject& itemObj = it.value().toObject();

            // Apply search filter
            if (!m_searchText.isEmpty()) {
                QString displayName = itemObj.value("display_name").toString(name);
                if (!name.contains(m_searchText, Qt::CaseInsensitive) &&
                    !displayName.contains(m_searchText, Qt::CaseInsensitive)) {
                    continue;
                }
            }

            auto* item = new GameDepItem;
            item->name = name;
            item->displayName = itemObj.value("display_name").toString(name);
            item->description = itemObj.value("description").toString();
            item->type = type;
            item->uuid = itemObj.value("uuid").toString();
            item->pictures = itemObj.value("pictures").toArray();
            item->dependencies = itemObj.value("dependencies").toArray();
            item->revisions = itemObj.value("revisions").toObject();
            item->installed = m_installedMap.value(name, false);
            item->installedVersion = m_installedVersions.value(name);

            GameDepItem* targetCategory = nullptr;
            if (type == "game") {
                targetCategory = item->installed ? catInstalledGames : catNotInstalledGames;
            } else {
                targetCategory = item->installed ? catInstalledDeps : catNotInstalledDeps;
            }

            item->parent = targetCategory;
            item->row = targetCategory->children.size();
            targetCategory->children.append(item);
        }
    };

    // Process games
    if (m_fullCatalog.contains("games")) {
        processItems(m_fullCatalog["games"].toObject(), "game");
    }

    // Process dependencies
    if (m_fullCatalog.contains("dependencies")) {
        processItems(m_fullCatalog["dependencies"].toObject(), "dep");
    }

    // Add categories to root (even if empty, for consistent UI)
    QList<GameDepItem*> categories = {
        catInstalledGames, catNotInstalledGames,
        catInstalledDeps, catNotInstalledDeps
    };

    int row = 0;
    for (auto* cat : categories) {
        cat->parent = m_rootItem;
        cat->row = row++;
        m_rootItem->children.append(cat);
    }

    endResetModel();
    emit totalCountChanged();
}

GameDepItem* GameDepModel::createCategoryItem(const QString& name)
{
    auto* item = new GameDepItem;
    item->name = name;
    item->displayName = name;
    item->type = "category";
    return item;
}

GameDepItem* GameDepModel::itemFromIndex(const QModelIndex& index) const
{
    if (!index.isValid())
        return m_rootItem;
    return static_cast<GameDepItem*>(index.internalPointer());
}

} // namespace Hypernucleus
