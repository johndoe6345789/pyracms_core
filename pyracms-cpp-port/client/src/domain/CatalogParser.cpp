#include "domain/CatalogParser.h"

#include <QJsonValue>
#include <algorithm>

namespace Hypernucleus {
namespace CatalogParser {

namespace {

QString firstString(const QJsonObject& o, std::initializer_list<const char*> keys)
{
    for (const char* k : keys) {
        const QJsonValue v = o.value(QLatin1String(k));
        if (v.isString() && !v.toString().isEmpty())
            return v.toString();
        if (v.isDouble())
            return QString::number(v.toDouble(), 'g', 15);
    }
    return {};
}

qint64 firstNumber(const QJsonObject& o, std::initializer_list<const char*> keys)
{
    for (const char* k : keys) {
        const QJsonValue v = o.value(QLatin1String(k));
        if (v.isDouble())
            return static_cast<qint64>(v.toDouble());
        if (v.isString()) {
            bool ok = false;
            const qint64 n = v.toString().toLongLong(&ok);
            if (ok)
                return n;
        }
    }
    return 0;
}

QString cleanSha(const QString& s)
{
    QString t = s.trimmed().toLower();
    if (t.startsWith("sha256:"))
        t = t.mid(7);
    return t;
}

QString fileRefOf(const QJsonObject& o)
{
    return firstString(o, {"fileUuid", "file_uuid", "source_uuid", "uuid",
                           "fileId", "file_id"});
}

BinaryInfo parseBinary(const QJsonObject& o)
{
    BinaryInfo b;
    b.os = firstString(o, {"os", "osName", "operating_system", "operatingSystem"});
    b.arch = firstString(o, {"arch", "archName", "architecture"});
    b.fileRef = fileRefOf(o);
    b.url = firstString(o, {"url", "binary", "downloadUrl"});
    b.size = firstNumber(o, {"size", "sizeBytes", "fileSize", "file_size"});
    b.sha256 = cleanSha(firstString(o, {"sha256", "checksum", "sha256sum"}));
    b.executable = firstString(o, {"executable", "entryPoint", "entry_point"});
    return b;
}

RevisionInfo parseRevision(const QJsonObject& o)
{
    RevisionInfo r;
    r.version = firstString(o, {"version"});
    r.moduleType = firstString(o, {"moduleType", "moduletype", "module_type"});
    r.fileRef = fileRefOf(o);
    r.url = firstString(o, {"source", "url", "downloadUrl"});
    r.createdAt = firstString(o, {"createdAt", "created"});
    r.published = o.contains("published") ? o.value("published").toBool(true) : true;
    r.size = firstNumber(o, {"size", "sizeBytes", "fileSize", "file_size"});
    r.sha256 = cleanSha(firstString(o, {"sha256", "checksum", "sha256sum"}));
    r.executable = firstString(o, {"executable", "entryPoint", "entry_point"});
    const QJsonArray bins = o.value("binaries").toArray();
    for (const QJsonValue& bv : bins) {
        if (bv.isObject())
            r.binaries.append(parseBinary(bv.toObject()));
    }
    return r;
}

QStringList parseTags(const QJsonArray& arr)
{
    QStringList tags;
    for (const QJsonValue& v : arr) {
        const QString t = v.isObject() ? v.toObject().value("name").toString()
                                       : v.toString();
        if (!t.trimmed().isEmpty() && !tags.contains(t.trimmed()))
            tags.append(t.trimmed());
    }
    return tags;
}

QStringList parseShots(const QJsonObject& o, QString* hero)
{
    QStringList shots;
    QJsonArray arr = o.value("screenshots").toArray();
    if (arr.isEmpty())
        arr = o.value("pictures").toArray();
    for (const QJsonValue& v : arr) {
        QString ref;
        bool isDefault = false;
        if (v.isObject()) {
            const QJsonObject po = v.toObject();
            ref = firstString(po, {"url", "src", "uuid", "id"});
            isDefault = po.value("default").toBool(false);
        } else {
            ref = v.toString();
        }
        if (ref.isEmpty())
            continue;
        shots.append(ref);
        if (isDefault && hero && hero->isEmpty())
            *hero = ref;
    }
    return shots;
}

QList<DepRef> parseDeps(const QJsonArray& arr)
{
    QList<DepRef> deps;
    for (const QJsonValue& v : arr) {
        DepRef d;
        if (v.isObject()) {
            const QJsonObject o = v.toObject();
            d.name = firstString(o, {"dependency", "name", "depName"});
            d.version = firstString(o, {"version", "depVersion"});
            d.source = o.value("source").toString().toLower();
            if (d.source != "pip" && d.source != "pyracms")
                d.source.clear();
        } else {
            d.name = v.toString();
        }
        if (!d.name.isEmpty())
            deps.append(d);
    }
    return deps;
}

QStringList parsePip(const QJsonObject& o)
{
    QStringList out;
    for (const char* key : {"pip", "requirements", "pipRequirements"}) {
        const QJsonValue v = o.value(QLatin1String(key));
        if (v.isArray()) {
            const QJsonArray arr = v.toArray();
            for (const QJsonValue& e : arr)
                if (!e.toString().trimmed().isEmpty())
                    out.append(e.toString().trimmed());
        } else if (v.isString()) {
            const QStringList lines = v.toString().split('\n', Qt::SkipEmptyParts);
            for (const QString& line : lines)
                if (!line.trimmed().isEmpty() && !line.trimmed().startsWith('#'))
                    out.append(line.trimmed());
        }
    }
    out.removeDuplicates();
    return out;
}

} // namespace

QString normalizeType(const QString& type)
{
    const QString t = type.trimmed().toLower();
    if (t == "dep" || t == "dependency" || t == "deps" || t == "dependencies")
        return QStringLiteral("dep");
    return QStringLiteral("game");
}

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
    if (!explicitHero.isEmpty())
        e.hero = explicitHero;
    e.likes = static_cast<int>(firstNumber(o, {"likes"}));
    e.dislikes = static_cast<int>(firstNumber(o, {"dislikes"}));
    e.views = static_cast<int>(firstNumber(o, {"viewCount", "views"}));
    e.dependencies = parseDeps(o.value("dependencies").toArray());
    e.pipRequirements = parsePip(o);
    const QJsonArray revs = o.value("revisions").toArray();
    for (const QJsonValue& rv : revs) {
        if (rv.isObject())
            e.revisions.append(parseRevision(rv.toObject()));
    }
    // Detail responses carry the full picture; list rows do not.
    e.detailLoaded = o.contains("dependencies") || o.contains("tags")
                  || o.contains("pictures") || o.contains("screenshots");
    return e;
}

QList<GameEntry> parseCatalog(const QJsonObject& catalog)
{
    QList<GameEntry> out;
    const QJsonArray games = catalog.value("games").toArray();
    for (const QJsonValue& v : games)
        if (v.isObject())
            out.append(parseEntry(v.toObject(), "game"));
    const QJsonArray deps = catalog.value("deps").toArray();
    for (const QJsonValue& v : deps)
        if (v.isObject())
            out.append(parseEntry(v.toObject(), "dep"));

    // Legacy Hypernucleus manifest: {"gamedep": [{"game": {...}}, {"dependency": {...}}]}
    const QJsonArray legacy = catalog.value("gamedep").toArray();
    for (const QJsonValue& v : legacy) {
        const QJsonObject wrapper = v.toObject();
        if (wrapper.contains("game"))
            out.append(parseEntry(wrapper.value("game").toObject(), "game"));
        else if (wrapper.contains("dependency"))
            out.append(parseEntry(wrapper.value("dependency").toObject(), "dep"));
    }
    // Original manifests list every module fully, so they are complete.
    if (catalog.contains("gamedep")) {
        for (GameEntry& e : out)
            e.detailLoaded = true;
    }

    out.erase(std::remove_if(out.begin(), out.end(),
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
    if (d.likes || d.dislikes) { into.likes = d.likes; into.dislikes = d.dislikes; }
    if (d.views) into.views = d.views;
    into.detailLoaded = true;
}

} // namespace CatalogParser
} // namespace Hypernucleus
