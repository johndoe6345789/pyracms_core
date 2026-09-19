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

void EntryRepository::ensureDetail(const QString& type, const QString& name)
{
    const QString key = keyOf(type, name);
    const auto it = m_entries.constFind(key);
    if (it != m_entries.constEnd() && it->detailLoaded) {
        QTimer::singleShot(
            0, this, [this, type, name]() { emit entryChanged(type, name); });
        return;
    }
    if (m_inFlight.contains(key)) return;
    m_inFlight.insert(key);

    QPointer<EntryRepository> self(this);
    const QString path = "/api/gamedep/" + type + "/" +
                         QString::fromLatin1(QUrl::toPercentEncoding(name));
    m_api->getJson(path, [self, key, type, name](bool ok,
                                                 const QJsonDocument& doc, int,
                                                 const QString& err) {
        if (!self) return;
        self->m_inFlight.remove(key);
        if (!ok || !doc.isObject()) {
            emit self->detailFailed(type, name,
                                    err.isEmpty() ? tr("Not found") : err);
            return;
        }
        auto found = self->m_entries.find(key);
        if (found == self->m_entries.end()) {
            GameEntry fresh = CatalogParser::parseEntry(doc.object(), type);
            fresh.name = name;
            fresh.detailLoaded = true;
            self->m_entries.insert(key, fresh);
        } else {
            CatalogParser::mergeDetail(found.value(), doc.object());
        }
        emit self->entryChanged(type, name);
    });
}

} // namespace Hypernucleus
