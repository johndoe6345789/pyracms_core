#pragma once

#include <QString>

namespace Hypernucleus {
namespace VersionCompare {

// <0, 0, >0. Numeric segments compare numerically ("1.10" > "1.9"),
// missing segments count as 0, non-numeric segments compare as text.
int compare(const QString& a, const QString& b);

} // namespace VersionCompare
} // namespace Hypernucleus
