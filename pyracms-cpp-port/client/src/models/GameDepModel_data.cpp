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

QVariant GameDepModel::data(const QModelIndex& index, int role) const
{
    if (!index.isValid() || index.row() < 0 || index.row() >= m_rows.size())
        return {};
    const Row& row = m_rows.at(index.row());
    switch (role) {
    case Qt::DisplayRole:
    case TitleRole:
        return row.title;
    case NameRole:
        return row.name;
    case DescriptionRole:
        return row.description;
    case TagsRole:
        return row.tags;
    case InstalledRole:
        return m_installer && m_installer->isInstalled(row.name);
    case InstalledVersionRole:
        return m_installer ? m_installer->installedVersion(row.name)
                           : QString();
    case LatestVersionRole:
        return row.latest;
    case UpdateAvailableRole:
        return updateAvailable(row);
    case StateRole:
        return computeState(row);
    case ProgressRole:
        return progressOf(row.name);
    case StatusTextRole:
        return statusTextOf(row.name);
    case FavouriteRole:
        return m_favourites.contains(row.name);
    case AccentRole:
        return row.accent;
    case CoverRole:
        return row.coverRef.isEmpty() || !m_api
                   ? QString()
                   : m_api->resolveUrl(MediaRef::toPath(row.coverRef))
                         .toString();
    case PrimaryKindRole:
    case PrimaryLabelRole: {
        const SelectedGameView::Primary p = SelectedGameView::primaryFor(
            computeState(row), progressOf(row.name),
            m_installer ? m_installer->installedVersion(row.name) : QString(),
            QString());
        return role == PrimaryKindRole ? p.kind : p.label;
    }
    case SizeRole:
        return row.size;
    case ScreenshotCountRole:
        return row.shots;
    case GroupRole:
        return m_installer && m_installer->isInstalled(row.name)
                   ? tr("Installed")
                   : tr("Not installed");
    default:
        return {};
    }
}

QStringList GameDepModel::categories() const
{
    return m_repo ? m_repo->allTags("game") : QStringList();
}

} // namespace Hypernucleus
