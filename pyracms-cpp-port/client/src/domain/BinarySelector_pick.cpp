#include "domain/BinarySelector.h"

namespace Hypernucleus {
namespace BinarySelector {

namespace {

// 2 exact, 1 platform independent, -1 mismatch
int score(const QString& have, const QString& want, bool isOs)
{
    if (isPlatformIndependent(have)) return 1;
    const QString a = isOs ? normalizeOs(have) : normalizeArch(have);
    const QString b = isOs ? normalizeOs(want) : normalizeArch(want);
    return a == b ? 2 : -1;
}

} // namespace

namespace {

const BinaryInfo* bestFor(const QList<BinaryInfo>& binaries,
                          const QString& os, const QString& arch)
{
    const BinaryInfo* best = nullptr;
    int bestScore = -1;
    for (const BinaryInfo& b : binaries) {
        const int so = score(b.os, os, true);
        const int sa = score(b.arch, arch, false);
        if (so < 1 || sa < 1) continue;
        const int total = so * 10 + sa;
        if (total > bestScore) {
            bestScore = total;
            best = &b;
        }
    }
    return best;
}

} // namespace

bool emulatesX64(const QString& os, const QString& arch)
{
    const QString o = normalizeOs(os);
    return normalizeArch(arch) == "arm64" &&
           (o == "windows" || o == "macos");
}

const BinaryInfo* pickBinary(const QList<BinaryInfo>& binaries,
                             const QString& os, const QString& arch)
{
    const BinaryInfo* best = bestFor(binaries, os, arch);
    // Windows on ARM (x64 emulation) and macOS arm64 (Rosetta 2) run
    // x86_64 builds, but only when no native arm64 build exists.
    if (!best && emulatesX64(os, arch))
        best = bestFor(binaries, os, QStringLiteral("x86_64"));
    return best;
}

} // namespace BinarySelector
} // namespace Hypernucleus
