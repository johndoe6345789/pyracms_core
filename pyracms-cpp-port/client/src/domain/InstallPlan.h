#pragma once

#include "domain/BinarySelector.h"

#include <QList>
#include <QString>
#include <QStringList>

namespace Hypernucleus {

struct PlanStep {
    enum class Kind { Module, Pip };

    Kind kind = Kind::Module;
    QString name;             // module name, or the game a Pip step belongs to
    QString version;
    QString type;             // "game" | "dep" (Module steps)
    DownloadTarget target;    // Module steps
    QStringList pipSpecs;     // Pip steps

    QString label() const
    {
        return kind == Kind::Pip ? QStringLiteral("pip packages for %1").arg(name)
                                 : QStringLiteral("%1 %2").arg(name, version);
    }
};

// Ordered work needed to install one game: PyraCMS dependency modules
// first, then the game itself, then pip packages into its pylibs folder.
struct InstallPlan {
    QString rootName;
    QString rootVersion;
    QList<PlanStep> steps;
    QStringList depNames;     // every PyraCMS dependency module (recursive)
    QStringList pipSpecs;     // every pip requirement
};

} // namespace Hypernucleus
