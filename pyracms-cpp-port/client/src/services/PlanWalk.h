#pragma once

#include "domain/GameEntry.h"

#include <QMap>
#include <QSet>
#include <QStringList>

namespace Hypernucleus {

class EntryRepository;

// Result of walking a game's dependency graph (see walkDeps).
struct Walk {
    QStringList unknown;     // not yet classified as pip / PyraCMS
    QStringList needDetail;  // PyraCMS deps whose page is not loaded yet
    QStringList missing;     // neither on pip nor known to PyraCMS
    QStringList pipSpecs;    // collected pip requirements
    QStringList moduleNames; // reachable PyraCMS dependency modules
};

QString pipSpecFor(const DepRef& d);

// known=false when the name is not yet classified as pip / PyraCMS.
bool isPipDep(const DepRef& d, const QMap<QString, bool>& resolved,
              bool* known);

void walkDeps(const QList<DepRef>& deps, const EntryRepository& repo,
              const QMap<QString, bool>& resolved, QSet<QString>& seen,
              Walk& out);

} // namespace Hypernucleus
