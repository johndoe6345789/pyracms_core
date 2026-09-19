#include "domain/PythonAssets.h"
#include "domain/BinarySelector.h"
#include "domain/VersionCompare.h"

#include <QJsonArray>
#include <QRegularExpression>

namespace Hypernucleus {
namespace PythonAssets {

QString triple(const QString& os, const QString& arch)
{
    const QString o = BinarySelector::normalizeOs(os);
    const QString a = BinarySelector::normalizeArch(arch);
    if (a != "x86_64" && a != "arm64") return {};
    const QString cpu = a == "arm64" ? "aarch64" : "x86_64";
    if (o == "windows") return cpu + "-pc-windows-msvc";
    if (o == "macos") return cpu + "-apple-darwin";
    if (o == "linux") return cpu + "-unknown-linux-gnu";
    return {};
}

PythonAsset pick(const QJsonObject& release, const QString& os,
                 const QString& arch, const QString& minor)
{
    PythonAsset best;
    const QString tri = triple(os, arch);
    if (tri.isEmpty()) return best;
    const QRegularExpression re(
        "^cpython-(" + QRegularExpression::escape(minor) +
        R"(\.\d+)\+\d+-)" + QRegularExpression::escape(tri) +
        R"(-install_only\.(tar\.gz|zip)$)");
    const QJsonArray assets = release.value("assets").toArray();
    for (const QJsonValue& v : assets) {
        const QJsonObject a = v.toObject();
        const auto m = re.match(a.value("name").toString());
        if (!m.hasMatch()) continue;
        const QString version = m.captured(1);
        if (best.isValid() && VersionCompare::compare(version, best.version) <= 0)
            continue;
        best.name = a.value("name").toString();
        best.url = a.value("browser_download_url").toString();
        best.version = version;
        best.size = static_cast<qint64>(a.value("size").toDouble());
    }
    return best;
}

QString shaFor(const QString& sums, const QString& assetName)
{
    const QStringList lines = sums.split('\n', Qt::SkipEmptyParts);
    for (const QString& raw : lines) {
        const QString line = raw.trimmed();
        const int sep = line.indexOf(' ');
        if (sep < 0) continue;
        QString file = line.mid(sep).trimmed();
        if (file.startsWith('*')) file.remove(0, 1); // binary-mode marker
        if (file == assetName) return line.left(sep).toLower();
    }
    return {};
}

} // namespace PythonAssets
} // namespace Hypernucleus
