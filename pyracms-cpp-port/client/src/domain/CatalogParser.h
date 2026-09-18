#pragma once

#include "domain/GameEntry.h"

#include <QJsonArray>
#include <QJsonObject>

namespace Hypernucleus {
namespace CatalogParser {

// Normalise "dependency" / "dep" / "game" -> "dep" / "game".
QString normalizeType(const QString& type);

// Parse one page (list row, detail response or legacy catalog item).
// Accepts both the PyraCMS API spelling (displayName, fileId, moduleType)
// and the original Hypernucleus manifest spelling (display_name,
// source_uuid, moduletype, binaries[].operating_system, ...).
GameEntry parseEntry(const QJsonObject& obj, const QString& type);

// Parse a whole catalog document. Supports {games:[], deps:[]} from
// /api/outputs/json and the legacy {gamedep:[{game:{}},{dependency:{}}]}.
QList<GameEntry> parseCatalog(const QJsonObject& catalog);

// Merge a detail response into an existing entry (keeps list-only data).
void mergeDetail(GameEntry& into, const QJsonObject& detail);

} // namespace CatalogParser
} // namespace Hypernucleus
