#include "models/GameDepModel.h"
#include "models/Constants.h"
#include "services/ApiClient.h"
#include "services/EntryRepository.h"
#include "services/ModuleInstaller.h"
#include "domain/BinarySelector.h"
#include "domain/Format.h"
#include "domain/MediaRef.h"
#include "domain/VersionCompare.h"
#include "viewmodels/SelectedGameView.h"

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

void GameDepModel::fillRow(Row& row) const
{
    const GameEntry* e = m_repo->find(row.name, "game");
    if (!e) return;
    row.title = e->title();
    row.description = e->description;
    row.tags = e->tags;
    row.latest = e->latestVersion();
    row.coverRef =
        !e->hero.isEmpty()
            ? e->hero
            : (!e->screenshots.isEmpty() ? e->screenshots.first() : QString());
    row.accent = accentFor(e->name);
    row.shots = e->screenshots.size();
    const RevisionInfo* rev = e->revision(row.latest);
    const DownloadTarget t =
        rev ? BinarySelector::resolveTarget(*rev, "game", m_os, m_arch)
            : DownloadTarget();
    row.size = t.ok && t.size > 0 ? Format::bytes(t.size) : QString();
}

} // namespace Hypernucleus
