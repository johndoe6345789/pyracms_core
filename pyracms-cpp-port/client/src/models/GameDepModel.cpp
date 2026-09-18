#include "models/GameDepModel.h"
#include "models/Constants.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"
#include "services/ModuleInstaller.h"
#include "domain/MediaRef.h"
#include "domain/VersionCompare.h"

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

GameDepModel::GameDepModel(QObject* parent)
    : QAbstractListModel(parent)
{
    QSettings s;
    m_favourites = s.value("library/favourites").toStringList();
}

void GameDepModel::attach(EntryRepository* repo, ModuleInstaller* installer, ApiClient* api)
{
    m_repo = repo;
    m_installer = installer;
    m_api = api;
    connect(m_repo, &EntryRepository::refreshed, this, &GameDepModel::rebuild);
    connect(m_repo, &EntryRepository::entryChanged, this,
            [this](const QString& type, const QString& name) {
        if (type == "game")
            refreshRow(name);
    });
    connect(m_installer, &ModuleInstaller::installStateChanged, this,
            &GameDepModel::refreshAll);
    rebuild();
}

int GameDepModel::rowCount(const QModelIndex& parent) const
{
    return parent.isValid() ? 0 : m_rows.size();
}

QHash<int, QByteArray> GameDepModel::roleNames() const
{
    return {
        {NameRole, "name"},
        {TitleRole, "title"},
        {DescriptionRole, "description"},
        {TagsRole, "tags"},
        {InstalledRole, "installed"},
        {InstalledVersionRole, "installedVersion"},
        {LatestVersionRole, "latestVersion"},
        {UpdateAvailableRole, "updateAvailable"},
        {StateRole, "gameState"},   // not "state": Item.state would shadow it
        {ProgressRole, "progress"},
        {StatusTextRole, "statusText"},
        {FavouriteRole, "favourite"},
        {AccentRole, "accent"},
        {CoverRole, "cover"},
        {GroupRole, "group"},
    };
}

QVariant GameDepModel::data(const QModelIndex& index, int role) const
{
    if (!index.isValid() || index.row() < 0 || index.row() >= m_rows.size())
        return {};
    const Row& row = m_rows.at(index.row());
    switch (role) {
    case Qt::DisplayRole:
    case TitleRole: return row.title;
    case NameRole: return row.name;
    case DescriptionRole: return row.description;
    case TagsRole: return row.tags;
    case InstalledRole: return m_installer && m_installer->isInstalled(row.name);
    case InstalledVersionRole: return m_installer ? m_installer->installedVersion(row.name) : QString();
    case LatestVersionRole: return row.latest;
    case UpdateAvailableRole: return updateAvailable(row);
    case StateRole: return computeState(row);
    case ProgressRole: return progressOf(row.name);
    case StatusTextRole: return statusTextOf(row.name);
    case FavouriteRole: return m_favourites.contains(row.name);
    case AccentRole: return row.accent;
    case CoverRole:
        return row.coverRef.isEmpty() || !m_api
            ? QString()
            : m_api->resolveUrl(MediaRef::toPath(row.coverRef)).toString();
    case GroupRole:
        return m_installer && m_installer->isInstalled(row.name) ? tr("Installed")
                                                                  : tr("Not installed");
    default: return {};
    }
}

QStringList GameDepModel::categories() const
{
    return m_repo ? m_repo->allTags("game") : QStringList();
}

void GameDepModel::fillRow(Row& row) const
{
    const GameEntry* e = m_repo->find(row.name, "game");
    if (!e)
        return;
    row.title = e->title();
    row.description = e->description;
    row.tags = e->tags;
    row.latest = e->latestVersion();
    row.coverRef = !e->hero.isEmpty() ? e->hero
                 : (!e->screenshots.isEmpty() ? e->screenshots.first() : QString());
    row.accent = accentFor(e->name);
}

void GameDepModel::rebuild()
{
    if (!m_repo)
        return;
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
        if (m_rows.at(i).name == name)
            return i;
    return -1;
}

void GameDepModel::emitRow(int row, const QList<int>& roles)
{
    if (row < 0 || row >= m_rows.size())
        return;
    emit dataChanged(index(row), index(row), roles);
}

void GameDepModel::refreshAll()
{
    if (m_rows.isEmpty())
        return;
    emit dataChanged(index(0), index(m_rows.size() - 1));
}

void GameDepModel::refreshRow(const QString& name)
{
    const int i = rowOf(name);
    if (i < 0)
        return;
    fillRow(m_rows[i]);
    emitRow(i);
    emit categoriesChanged();
}

bool GameDepModel::updateAvailable(const Row& row) const
{
    if (!m_installer || row.latest.isEmpty())
        return false;
    const QString have = m_installer->installedVersion(row.name);
    return !have.isEmpty() && VersionCompare::compare(have, row.latest) < 0;
}

int GameDepModel::computeState(const Row& row) const
{
    const auto t = m_transient.constFind(row.name);
    if (t != m_transient.constEnd())
        return t->state;
    if (!m_installer || !m_installer->isInstalled(row.name))
        return GameStates::NotInstalled;
    return updateAvailable(row) ? GameStates::UpdateAvailable : GameStates::Installed;
}

int GameDepModel::stateOf(const QString& name) const
{
    const int i = rowOf(name);
    return i < 0 ? static_cast<int>(GameStates::NotInstalled) : computeState(m_rows.at(i));
}

double GameDepModel::progressOf(const QString& name) const
{
    return m_transient.value(name).progress;
}

QColor GameDepModel::accentOf(const QString& name) const
{
    return accentFor(name);
}

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
    if (!m_favourites.removeOne(name))
        m_favourites.append(name);
    QSettings s;
    s.setValue("library/favourites", m_favourites);
    emitRow(rowOf(name));   // all roles: the category filter depends on it
}

} // namespace Hypernucleus
