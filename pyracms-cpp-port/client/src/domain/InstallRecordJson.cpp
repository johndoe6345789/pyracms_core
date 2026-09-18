#include "domain/InstallRecordJson.h"

#include <QJsonArray>

namespace Hypernucleus {
namespace InstallJson {

QJsonArray toArray(const QStringList& list)
{
    QJsonArray a;
    for (const QString& s : list)
        a.append(s);
    return a;
}

QStringList toList(const QJsonValue& v)
{
    QStringList l;
    const QJsonArray arr = v.toArray();
    for (const QJsonValue& e : arr)
        l.append(e.toString());
    return l;
}

QJsonObject toJson(const InstallRecord& r)
{
    QJsonObject o;
    o["name"] = r.name;
    o["version"] = r.version;
    o["type"] = r.type;
    o["path"] = r.path;
    o["moduleType"] = r.moduleType;
    o["kind"] = r.kind;
    o["executable"] = r.executable;
    o["deps"] = toArray(r.deps);
    o["pipSpecs"] = toArray(r.pipSpecs);
    o["installedAt"] = r.installedAt;
    o["sizeBytes"] = static_cast<double>(r.sizeBytes);
    return o;
}

InstallRecord fromJson(const QJsonObject& o)
{
    InstallRecord r;
    r.name = o.value("name").toString();
    r.version = o.value("version").toString();
    r.type = o.value("type").toString("game");
    r.path = o.value("path").toString();
    r.moduleType = o.value("moduleType").toString();
    r.kind = o.value("kind").toString("python");
    r.executable = o.value("executable").toString();
    r.deps = toList(o.value("deps"));
    r.pipSpecs = toList(o.value("pipSpecs"));
    r.installedAt = o.value("installedAt").toString();
    r.sizeBytes = static_cast<qint64>(o.value("sizeBytes").toDouble());
    return r;
}

} // namespace InstallJson
} // namespace Hypernucleus
