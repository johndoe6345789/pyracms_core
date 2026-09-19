#include "domain/CatalogParser.h"

#include <QJsonValue>
#include <algorithm>

namespace Hypernucleus {
namespace CatalogParser {

QList<GameEntry> parseCatalog(const QJsonObject& catalog)
{
    QList<GameEntry> out;
    const QJsonArray games = catalog.value("games").toArray();
    for (const QJsonValue& v : games)
        if (v.isObject()) out.append(parseEntry(v.toObject(), "game"));
    const QJsonArray deps = catalog.value("deps").toArray();
    for (const QJsonValue& v : deps)
        if (v.isObject()) out.append(parseEntry(v.toObject(), "dep"));

    // Legacy Hypernucleus manifest: {"gamedep": [{"game": {...}},
    // {"dependency": {...}}]}
    const QJsonArray legacy = catalog.value("gamedep").toArray();
    for (const QJsonValue& v : legacy) {
        const QJsonObject wrapper = v.toObject();
        if (wrapper.contains("game"))
            out.append(parseEntry(wrapper.value("game").toObject(), "game"));
        else if (wrapper.contains("dependency"))
            out.append(
                parseEntry(wrapper.value("dependency").toObject(), "dep"));
    }
    // Original manifests list every module fully, so they are complete.
    if (catalog.contains("gamedep")) {
        for (GameEntry& e : out)
            e.detailLoaded = true;
    }

    out.erase(
        std::remove_if(out.begin(), out.end(),
                       [](const GameEntry& e) { return e.name.isEmpty(); }),
        out.end());
    return out;
}

void mergeDetail(GameEntry& into, const QJsonObject& detail)
{
    const GameEntry d = parseEntry(detail, into.type);
    if (!d.displayName.isEmpty()) into.displayName = d.displayName;
    if (!d.description.isEmpty()) into.description = d.description;
    if (!d.tags.isEmpty()) into.tags = d.tags;
    if (!d.screenshots.isEmpty()) into.screenshots = d.screenshots;
    if (!d.hero.isEmpty()) into.hero = d.hero;
    if (!d.revisions.isEmpty()) into.revisions = d.revisions;
    into.dependencies = d.dependencies;
    into.pipRequirements = d.pipRequirements;
    if (d.likes || d.dislikes) {
        into.likes = d.likes;
        into.dislikes = d.dislikes;
    }
    if (d.views) into.views = d.views;
    if (d.downloads) into.downloads = d.downloads;
    if (!d.owner.isEmpty()) into.owner = d.owner;
    into.detailLoaded = true;
}

} // namespace CatalogParser
} // namespace Hypernucleus
