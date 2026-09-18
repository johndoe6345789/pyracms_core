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

EntryRepository::EntryRepository(ApiClient* api, QObject* parent)
    : QObject(parent)
    , m_api(api)
{
}

QString EntryRepository::keyOf(const QString& type, const QString& name)
{
    return type + "/" + name;
}

QList<GameEntry> EntryRepository::entries(const QString& type) const
{
    QList<GameEntry> out;
    for (const GameEntry& e : m_entries)
        if (type.isEmpty() || e.type == type)
            out.append(e);
    return out;
}

const GameEntry* EntryRepository::find(const QString& name, const QString& type) const
{
    if (!type.isEmpty()) {
        const auto it = m_entries.constFind(keyOf(type, name));
        return it == m_entries.constEnd() ? nullptr : &it.value();
    }
    const auto game = m_entries.constFind(keyOf("game", name));
    if (game != m_entries.constEnd())
        return &game.value();
    const auto dep = m_entries.constFind(keyOf("dep", name));
    return dep == m_entries.constEnd() ? nullptr : &dep.value();
}

QStringList EntryRepository::allTags(const QString& type) const
{
    QSet<QString> tags;
    for (const GameEntry& e : m_entries)
        if (type.isEmpty() || e.type == type)
            for (const QString& t : e.tags)
                tags.insert(t);
    QStringList out = tags.values();
    out.sort(Qt::CaseInsensitive);
    return out;
}

void EntryRepository::setEntries(const QList<GameEntry>& entries)
{
    m_entries.clear();
    for (const GameEntry& e : entries)
        m_entries.insert(keyOf(e.type, e.name), e);
    m_loaded = true;
    emit refreshed();
}

void EntryRepository::setRefreshing(bool on)
{
    if (m_refreshing == on)
        return;
    m_refreshing = on;
    emit refreshingChanged();
}

void EntryRepository::applyCatalog(const QList<GameEntry>& fresh)
{
    QMap<QString, GameEntry> next;
    for (GameEntry e : fresh) {
        const QString key = keyOf(e.type, e.name);
        const auto old = m_entries.constFind(key);
        if (old != m_entries.constEnd() && old->detailLoaded && !e.detailLoaded) {
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
    m_api->getJson("/api/outputs/json",
                   [self, gen](bool ok, const QJsonDocument& doc, int, const QString& err) {
        if (!self || gen != self->m_generation)
            return;
        if (!ok || !doc.isObject()) {
            self->refreshFallback(err, gen);
            return;
        }
        self->applyCatalog(CatalogParser::parseCatalog(doc.object()));
        self->setRefreshing(false);
        emit self->refreshed();
    });
}

// Older servers may lack /api/outputs/json; the per-type listings still work.
void EntryRepository::refreshFallback(const QString& firstError, int gen)
{
    QPointer<EntryRepository> self(this);
    m_api->getJson("/api/gamedep/game?limit=200",
                   [self, firstError, gen](bool ok, const QJsonDocument& games, int, const QString&) {
        if (!self || gen != self->m_generation)
            return;
        if (!ok) {
            self->setRefreshing(false);
            emit self->refreshFailed(firstError);
            return;
        }
        self->m_api->getJson("/api/gamedep/dep?limit=200",
                             [self, games, gen](bool depOk, const QJsonDocument& deps, int, const QString&) {
            if (!self || gen != self->m_generation)
                return;
            QList<GameEntry> all;
            const QJsonArray ga = games.array();
            for (const QJsonValue& v : ga)
                all.append(CatalogParser::parseEntry(v.toObject(), "game"));
            if (depOk) {
                const QJsonArray da = deps.array();
                for (const QJsonValue& v : da)
                    all.append(CatalogParser::parseEntry(v.toObject(), "dep"));
            }
            self->applyCatalog(all);
            self->setRefreshing(false);
            emit self->refreshed();
        });
    });
}

void EntryRepository::ensureDetail(const QString& type, const QString& name)
{
    const QString key = keyOf(type, name);
    const auto it = m_entries.constFind(key);
    if (it != m_entries.constEnd() && it->detailLoaded) {
        QTimer::singleShot(0, this, [this, type, name]() { emit entryChanged(type, name); });
        return;
    }
    if (m_inFlight.contains(key))
        return;
    m_inFlight.insert(key);

    QPointer<EntryRepository> self(this);
    const QString path = "/api/gamedep/" + type + "/"
        + QString::fromLatin1(QUrl::toPercentEncoding(name));
    m_api->getJson(path,
                   [self, key, type, name](bool ok, const QJsonDocument& doc, int, const QString& err) {
        if (!self)
            return;
        self->m_inFlight.remove(key);
        if (!ok || !doc.isObject()) {
            emit self->detailFailed(type, name, err.isEmpty() ? "Not found" : err);
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
