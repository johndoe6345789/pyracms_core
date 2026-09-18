#include "domain/BinarySelector.h"

namespace Hypernucleus {

QJsonObject DownloadTarget::toJson() const
{
    QJsonObject o;
    o["version"] = version;
    o["fileRef"] = fileRef;
    o["url"] = url;
    o["size"] = static_cast<double>(size);
    o["sha256"] = sha256;
    o["executable"] = executable;
    o["moduleType"] = moduleType;
    o["native"] = nativeBuild;
    return o;
}

DownloadTarget DownloadTarget::fromJson(const QJsonObject& o)
{
    DownloadTarget t;
    t.version = o.value("version").toString();
    t.fileRef = o.value("fileRef").toString();
    if (t.fileRef.isEmpty())
        t.fileRef =
            o.value("file_uuid").toString(o.value("fileUuid").toString());
    t.url = o.value("url").toString();
    t.size = static_cast<qint64>(o.value("size").toDouble());
    t.sha256 = o.value("sha256").toString();
    t.executable = o.value("executable").toString();
    t.moduleType = o.value("moduleType").toString();
    t.nativeBuild = o.value("native").toBool(false);
    t.ok = !t.fileRef.isEmpty() || !t.url.isEmpty();
    return t;
}

} // namespace Hypernucleus
