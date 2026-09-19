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

GameDepModel::GameDepModel(QObject* parent) : GameDepRows(parent)
{
    QSettings s;
    m_favourites = s.value("library/favourites").toStringList();
}

void GameDepModel::attach(EntryRepository* repo, ModuleInstaller* installer,
                          ApiClient* api)
{
    m_repo = repo;
    m_installer = installer;
    m_api = api;
    connect(m_repo, &EntryRepository::refreshed, this, &GameDepModel::rebuild);
    connect(m_repo, &EntryRepository::entryChanged, this,
            [this](const QString& type, const QString& name) {
                if (type == "game") refreshRow(name);
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
        {StateRole, "gameState"}, // not "state": Item.state would shadow it
        {ProgressRole, "progress"},
        {StatusTextRole, "statusText"},
        {FavouriteRole, "favourite"},
        {AccentRole, "accent"},
        {CoverRole, "cover"},
        {GroupRole, "group"},
        {PrimaryKindRole, "primaryKind"},
        {PrimaryLabelRole, "primaryLabel"},
        {SizeRole, "downloadSize"},
        {ScreenshotCountRole, "screenshotCount"},
    };
}

} // namespace Hypernucleus
