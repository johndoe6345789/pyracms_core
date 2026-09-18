#include "services/EntryRepository.h"
#include "services/ApiClient.h"
#include "domain/CatalogParser.h"

#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>
#include <QPointer>
#include <QTimer>
#include <QUrl>

namespace Hypernucleus {

void EntryRepository::applyCatalog(const QList<GameEntry>& fresh)
{
    QMap<QString, GameEntry> next;
    for (GameEntry e : fresh) {
        const QString key = keyOf(e.type, e.name);
        const auto old = m_entries.constFind(key);
        if (old != m_entries.constEnd() && old->detailLoaded &&
            !e.detailLoaded) {
            // Keep what only the detail endpoint knows; take fresh revisions.
            e.dependencies = old->dependencies;
            e.pipRequirements = old->pipRequirements;
            if (e.tags.isEmpty()) e.tags = old->tags;
            if (e.screenshots.isEmpty()) e.screenshots = old->screenshots;
            if (e.hero.isEmpty()) e.hero = old->hero;
            e.detailLoaded = true;
        }
        next.insert(key, e);
    }
    m_entries = next;
    m_loaded = true;
}

void EntryRepository::refresh()
{
    // A newer refresh (e.g. after switching site) supersedes older ones.
    const int gen = ++m_generation;
    setRefreshing(true);
    QPointer<EntryRepository> self(this);
    m_api->getJson("/api/outputs/json", [self, gen](bool ok,
                                                    const QJsonDocument& doc,
                                                    int, const QString& err) {
        if (!self || gen != self->m_generation) return;
        if (!ok || !doc.isObject()) {
            self->refreshFallback(err, gen);
            return;
        }
        self->applyCatalog(CatalogParser::parseCatalog(doc.object()));
        self->setRefreshing(false);
        emit self->refreshed();
    });
}

} // namespace Hypernucleus
