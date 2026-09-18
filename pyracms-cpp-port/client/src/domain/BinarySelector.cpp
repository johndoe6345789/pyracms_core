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
        t.fileRef = o.value("file_uuid").toString(o.value("fileUuid").toString());
    t.url = o.value("url").toString();
    t.size = static_cast<qint64>(o.value("size").toDouble());
    t.sha256 = o.value("sha256").toString();
    t.executable = o.value("executable").toString();
    t.moduleType = o.value("moduleType").toString();
    t.nativeBuild = o.value("native").toBool(false);
    t.ok = !t.fileRef.isEmpty() || !t.url.isEmpty();
    return t;
}

namespace BinarySelector {

QString normalizeOs(const QString& os)
{
    const QString s = os.trimmed().toLower();
    if (s == "win" || s == "win32" || s == "win64" || s == "windows")
        return QStringLiteral("windows");
    if (s == "mac" || s == "macos" || s == "darwin" || s == "osx" || s == "mac os x")
        return QStringLiteral("macos");
    if (s == "lin" || s == "linux")
        return QStringLiteral("linux");
    return s;
}

QString normalizeArch(const QString& arch)
{
    const QString s = arch.trimmed().toLower();
    if (s == "x86_64" || s == "amd64" || s == "x64" || s == "x86-64" || s == "64bit")
        return QStringLiteral("x86_64");
    if (s == "arm64" || s == "aarch64")
        return QStringLiteral("arm64");
    if (s == "x86" || s == "i386" || s == "i686" || s == "32bit")
        return QStringLiteral("x86");
    return s;
}

bool isPlatformIndependent(const QString& value)
{
    const QString s = value.trimmed().toLower();
    return s.isEmpty() || s == "pi" || s == "any" || s == "all" || s == "*";
}

namespace {

// 2 exact, 1 platform independent, -1 mismatch
int score(const QString& have, const QString& want, bool isOs)
{
    if (isPlatformIndependent(have))
        return 1;
    const QString a = isOs ? normalizeOs(have) : normalizeArch(have);
    const QString b = isOs ? normalizeOs(want) : normalizeArch(want);
    return a == b ? 2 : -1;
}

} // namespace

const BinaryInfo* pickBinary(const QList<BinaryInfo>& binaries,
                             const QString& os, const QString& arch)
{
    const BinaryInfo* best = nullptr;
    int bestScore = -1;
    for (const BinaryInfo& b : binaries) {
        const int so = score(b.os, os, true);
        const int sa = score(b.arch, arch, false);
        if (so < 1 || sa < 1)
            continue;
        const int total = so * 10 + sa;
        if (total > bestScore) {
            bestScore = total;
            best = &b;
        }
    }
    return best;
}

DownloadTarget resolveTarget(const RevisionInfo& rev, const QString& type,
                             const QString& os, const QString& arch)
{
    DownloadTarget t;
    t.version = rev.version;
    t.moduleType = rev.moduleType.isEmpty() ? QStringLiteral("folder") : rev.moduleType;

    const BinaryInfo* bin = pickBinary(rev.binaries, os, arch);
    const bool binaryIsConcrete = bin && !isPlatformIndependent(bin->os);
    const bool useBinary = bin && (type == "dep" || binaryIsConcrete);

    if (useBinary) {
        t.fileRef = bin->fileRef;
        t.url = bin->url;
        t.size = bin->size;
        t.sha256 = bin->sha256;
        t.executable = bin->executable.isEmpty() ? rev.executable : bin->executable;
        t.nativeBuild = binaryIsConcrete;
    } else if (!rev.fileRef.isEmpty() || !rev.url.isEmpty()) {
        t.fileRef = rev.fileRef;
        t.url = rev.url;
        t.size = rev.size;
        t.sha256 = rev.sha256;
        t.executable = rev.executable;
    } else if (!rev.binaries.isEmpty()) {
        t.error = QStringLiteral("No build of version %1 for %2 / %3")
                      .arg(rev.version, normalizeOs(os), normalizeArch(arch));
        return t;
    } else {
        t.error = QStringLiteral("No file UUID in revision data");
        return t;
    }
    t.ok = !t.fileRef.isEmpty() || !t.url.isEmpty();
    if (!t.ok)
        t.error = QStringLiteral("No file UUID in revision data");
    return t;
}

} // namespace BinarySelector
} // namespace Hypernucleus
