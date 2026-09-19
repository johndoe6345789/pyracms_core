#include "domain/CatalogFields.h"

namespace Hypernucleus {
namespace CatalogParser {

using namespace detail;

GameEntry parseEntry(const QJsonObject& o, const QString& type)
{
    GameEntry e;
    e.type = normalizeType(type.isEmpty() ? o.value("type").toString() : type);
    e.name = firstString(o, {"name"});
    e.displayName = firstString(o, {"displayName", "display_name"});
    e.description = firstString(o, {"description"});
    e.createdAt = firstString(o, {"createdAt", "created"});
    e.tags = parseTags(o.value("tags").toArray());
    e.screenshots = parseShots(o, &e.hero);
    const QString explicitHero = firstString(o, {"hero", "banner", "heroUrl"});
    if (!explicitHero.isEmpty()) e.hero = explicitHero;
    e.likes = static_cast<int>(firstNumber(o, {"likes"}));
    e.dislikes = static_cast<int>(firstNumber(o, {"dislikes"}));
    e.views = static_cast<int>(firstNumber(o, {"viewCount", "views"}));
    e.downloads = firstNumber(o, {"downloadCount", "downloads"});
    e.owner = firstString(o, {"ownerUsername", "owner"});
    e.dependencies = parseDeps(o.value("dependencies").toArray());
    e.pipRequirements = parsePip(o);
    const QJsonArray revs = o.value("revisions").toArray();
    for (const QJsonValue& rv : revs) {
        if (rv.isObject()) e.revisions.append(parseRevision(rv.toObject()));
    }
    // Detail responses carry the full picture; list rows do not.
    e.detailLoaded = o.contains("dependencies") || o.contains("tags") ||
                     o.contains("pictures") || o.contains("screenshots");
    return e;
}

} // namespace CatalogParser
} // namespace Hypernucleus
