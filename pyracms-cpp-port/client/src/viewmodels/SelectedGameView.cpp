#include "viewmodels/SelectedGameView.h"
#include "models/Constants.h"
#include "domain/Format.h"
#include "domain/MediaRef.h"
#include "domain/VersionCompare.h"

#include <QCoreApplication>
#include <algorithm>

namespace Hypernucleus {
namespace SelectedGameView {

QStringList publishedVersions(const GameEntry& entry)
{
    QStringList versions;
    for (const RevisionInfo& r : entry.revisions)
        if (r.published && !r.version.isEmpty() &&
            !versions.contains(r.version))
            versions << r.version;
    std::sort(versions.begin(), versions.end(),
              [](const QString& a, const QString& b) {
                  return VersionCompare::compare(a, b) > 0;
              });
    return versions;
}

} // namespace SelectedGameView
} // namespace Hypernucleus
