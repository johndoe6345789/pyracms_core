#include "domain/GameEntry.h"
#include "domain/VersionCompare.h"

namespace Hypernucleus {

QString GameEntry::latestVersion() const
{
    QString best;
    for (const RevisionInfo& rev : revisions) {
        if (!rev.published || rev.version.isEmpty()) continue;
        if (best.isEmpty() || VersionCompare::compare(rev.version, best) > 0)
            best = rev.version;
    }
    return best;
}

const RevisionInfo* GameEntry::revision(const QString& version) const
{
    for (const RevisionInfo& rev : revisions) {
        if (rev.version == version) return &rev;
        // Original Hypernucleus stored versions as floats ("1" vs "1.0")
        if (VersionCompare::compare(rev.version, version) == 0 &&
            !version.isEmpty())
            return &rev;
    }
    return nullptr;
}

} // namespace Hypernucleus
