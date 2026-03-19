#pragma once

#include <QObject>

namespace Hypernucleus {

Q_NAMESPACE

enum class ItemType {
    Game = 0,
    Dep = 1
};
Q_ENUM_NS(ItemType)

enum class ModuleType {
    File = 0,
    Folder = 1
};
Q_ENUM_NS(ModuleType)

// Custom roles for GameDepModel
enum GameDepRole {
    NameRole = Qt::UserRole + 1,
    DisplayNameRole,
    DescriptionRole,
    TypeRole,
    InstalledRole,
    VersionRole,
    CategoryRole,
    UuidRole,
    PicturesRole,
    DependenciesRole,
    RevisionsRole,
    ItemTypeRole,
    InstalledVersionRole
};

// Custom roles for DependencyModel
enum DependencyRole {
    DepNameRole = Qt::UserRole + 1,
    DepVersionRole,
    DepInstalledRole
};

// Category names
constexpr const char* CAT_INSTALLED_GAMES = "Installed Games";
constexpr const char* CAT_NOT_INSTALLED_GAMES = "Not Installed Games";
constexpr const char* CAT_INSTALLED_DEPS = "Installed Dependencies";
constexpr const char* CAT_NOT_INSTALLED_DEPS = "Not Installed Dependencies";

} // namespace Hypernucleus
