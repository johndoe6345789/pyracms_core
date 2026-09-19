#include "services/EntryRepository.h"
#include "services/ApiClient.h"
#include "domain/CatalogParser.h"

#include <QJsonDocument>
#include <QJsonObject>
#include <QPointer>
#include <QUrl>

namespace Hypernucleus {

// Anonymous catalog of one site: the tenant id comes from the public
// GET /api/tenants/<slug>, the catalog from /api/gamedep/catalog. Never
// without a tenant id.
void EntryRepository::resolveTenant(const QString& slug, int gen)
{
    QPointer<EntryRepository> self(this);
    const QString path =
        "/api/tenants/" + QString::fromLatin1(QUrl::toPercentEncoding(slug));
    m_api->getJson(path, [self, slug, gen](bool ok, const QJsonDocument& doc,
                                           int status, const QString& err) {
        if (!self || gen != self->m_generation) return;
        const int id = doc.object().value("id").toInt();
        if (ok && id > 0) {
            const QString q = "?tenant_id=" + QString::number(id);
            self->fetchCatalog(
                {"/api/gamedep/catalog" + q, "/api/outputs/json" + q}, gen);
        } else if (status == 404) {
            self->applyCatalog({}); // nothing of the previous site remains
            self->setRefreshing(false);
            emit self->refreshFailed(
                tr("Site \"%1\" was not found on this server.").arg(slug));
        } else { // no tenant id, so no catalog request at all
            self->setRefreshing(false);
            emit self->refreshFailed(
                tr("Could not reach the server: %1").arg(err));
        }
    });
}

// Tries each path in turn; the per-type listings are the last resort.
void EntryRepository::fetchCatalog(const QStringList& paths, int gen)
{
    QPointer<EntryRepository> self(this);
    m_api->getJson(paths.first(), [self, paths, gen](bool ok,
                                                     const QJsonDocument& doc,
                                                     int, const QString& err) {
        if (!self || gen != self->m_generation) return;
        if (ok && doc.isObject()) {
            self->applyCatalog(CatalogParser::parseCatalog(doc.object()));
            self->setRefreshing(false);
            emit self->refreshed();
        } else if (paths.size() > 1) {
            self->fetchCatalog(paths.mid(1), gen);
        } else {
            self->refreshFallback(err, gen);
        }
    });
}

} // namespace Hypernucleus
