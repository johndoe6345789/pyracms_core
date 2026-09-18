#include "domain/CatalogFields.h"

#include <QJsonValue>

namespace Hypernucleus {
namespace CatalogParser {
namespace detail {

BinaryInfo parseBinary(const QJsonObject& o)
{
    BinaryInfo b;
    b.os =
        firstString(o, {"os", "osName", "operating_system", "operatingSystem"});
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
    r.published =
        o.contains("published") ? o.value("published").toBool(true) : true;
    r.size = firstNumber(o, {"size", "sizeBytes", "fileSize", "file_size"});
    r.sha256 = cleanSha(firstString(o, {"sha256", "checksum", "sha256sum"}));
    r.executable = firstString(o, {"executable", "entryPoint", "entry_point"});
    const QJsonArray bins = o.value("binaries").toArray();
    for (const QJsonValue& bv : bins) {
        if (bv.isObject()) r.binaries.append(parseBinary(bv.toObject()));
    }
    return r;
}

} // namespace detail
} // namespace CatalogParser
} // namespace Hypernucleus
