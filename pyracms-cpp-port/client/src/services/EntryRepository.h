#pragma once

#include "domain/GameEntry.h"

#include <QMap>
#include <QObject>
#include <QSet>

namespace Hypernucleus {

class ApiClient;

// In-memory copy of the tenant's games and dependency modules, filled from
// /api/outputs/json and enriched lazily with /api/gamedep/{type}/{name}.
class EntryRepository : public QObject {
    Q_OBJECT

public:
    explicit EntryRepository(ApiClient* api, QObject* parent = nullptr);

    bool isLoaded() const { return m_loaded; }
    bool isRefreshing() const { return m_refreshing; }

    // `type` empty = all types.
    QList<GameEntry> entries(const QString& type = QString()) const;
    const GameEntry* find(const QString& name, const QString& type = QString()) const;
    QStringList allTags(const QString& type = QString()) const;

    void refresh();
    // Emits entryChanged (also when already loaded) or detailFailed.
    void ensureDetail(const QString& type, const QString& name);

    // Test hook / offline seeding.
    void setEntries(const QList<GameEntry>& entries);

signals:
    void refreshingChanged();
    void refreshed();
    void refreshFailed(const QString& error);
    void entryChanged(const QString& type, const QString& name);
    void detailFailed(const QString& type, const QString& name, const QString& error);

private:
    static QString keyOf(const QString& type, const QString& name);
    void applyCatalog(const QList<GameEntry>& fresh);
    void refreshFallback(const QString& firstError, int generation);
    void setRefreshing(bool on);

    ApiClient* m_api;
    QMap<QString, GameEntry> m_entries;
    QSet<QString> m_inFlight;
    bool m_loaded = false;
    bool m_refreshing = false;
    int m_generation = 0;
};

} // namespace Hypernucleus
