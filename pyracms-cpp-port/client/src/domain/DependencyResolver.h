#pragma once

#include "domain/GameEntry.h"

#include <functional>

namespace Hypernucleus {
namespace DependencyResolver {

// Returns the direct dependencies of a named dependency module.
using Lookup = std::function<QList<DepRef>(const QString& name)>;

// Depth-first, dependencies before dependents, each module exactly once
// (first requested version wins). Cycles are broken silently and reported
// in `cycles` as "a -> b" strings when provided.
QList<DepRef> resolveOrder(const QList<DepRef>& roots, const Lookup& lookup,
                           QStringList* cycles = nullptr);

} // namespace DependencyResolver
} // namespace Hypernucleus
