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
    : QObject(parent), m_api(api)
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
        if (type.isEmpty() || e.type == type) out.append(e);
    return out;
}

const GameEntry* EntryRepository::find(const QString& name,
                                       const QString& type) const
{
    if (!type.isEmpty()) {
        const auto it = m_entries.constFind(keyOf(type, name));
        return it == m_entries.constEnd() ? nullptr : &it.value();
    }
    const auto game = m_entries.constFind(keyOf("game", name));
    if (game != m_entries.constEnd()) return &game.value();
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
    if (m_refreshing == on) return;
    m_refreshing = on;
    emit refreshingChanged();
}

} // namespace Hypernucleus
