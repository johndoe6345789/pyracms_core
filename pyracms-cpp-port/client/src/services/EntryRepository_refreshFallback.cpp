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

// Older servers may lack /api/outputs/json; the per-type listings still work.
void EntryRepository::refreshFallback(const QString& firstError, int gen)
{
    QPointer<EntryRepository> self(this);
    m_api->getJson(
        "/api/gamedep/game?limit=200",
        [self, firstError, gen](bool ok, const QJsonDocument& games, int,
                                const QString&) {
            if (!self || gen != self->m_generation) return;
            if (!ok) {
                self->setRefreshing(false);
                emit self->refreshFailed(firstError);
                return;
            }
            self->m_api->getJson(
                "/api/gamedep/dep?limit=200",
                [self, games, gen](bool depOk, const QJsonDocument& deps, int,
                                   const QString&) {
                    if (!self || gen != self->m_generation) return;
                    QList<GameEntry> all;
                    const QJsonArray ga = games.array();
                    for (const QJsonValue& v : ga)
                        all.append(
                            CatalogParser::parseEntry(v.toObject(), "game"));
                    if (depOk) {
                        const QJsonArray da = deps.array();
                        for (const QJsonValue& v : da)
                            all.append(
                                CatalogParser::parseEntry(v.toObject(), "dep"));
                    }
                    self->applyCatalog(all);
                    self->setRefreshing(false);
                    emit self->refreshed();
                });
        });
}

} // namespace Hypernucleus
