#include "domain/BinarySelector.h"


namespace Hypernucleus {
namespace BinarySelector {

DownloadTarget resolveTarget(const RevisionInfo& rev, const QString& type,
                             const QString& os, const QString& arch)
{
    DownloadTarget t;
    t.version = rev.version;
    t.moduleType =
        rev.moduleType.isEmpty() ? QStringLiteral("folder") : rev.moduleType;

    const BinaryInfo* bin = pickBinary(rev.binaries, os, arch);
    const bool binaryIsConcrete = bin && !isPlatformIndependent(bin->os);
    const bool useBinary = bin && (type == "dep" || binaryIsConcrete);

    if (useBinary) {
        t.fileRef = bin->fileRef;
        t.url = bin->url;
        t.size = bin->size;
        t.sha256 = bin->sha256;
        t.executable =
            bin->executable.isEmpty() ? rev.executable : bin->executable;
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
    if (!t.ok) t.error = QStringLiteral("No file UUID in revision data");
    return t;
}

} // namespace BinarySelector
} // namespace Hypernucleus
