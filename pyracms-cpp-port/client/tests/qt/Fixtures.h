#pragma once

#include "domain/GameEntry.h"

// Compact builders for catalog entries used by planner/model tests.
inline Hypernucleus::RevisionInfo rev(const char* version, const char* fileRef,
                                      bool published = true)
{
    Hypernucleus::RevisionInfo r;
    r.version = version;
    r.fileRef = fileRef;
    r.moduleType = "folder";
    r.published = published;
    return r;
}

inline Hypernucleus::GameEntry
entry(const char* name, const char* type,
      QList<Hypernucleus::RevisionInfo> revisions,
      QList<Hypernucleus::DepRef> deps = {}, bool detailed = true)
{
    Hypernucleus::GameEntry e;
    e.name = name;
    e.displayName = QString(name).toUpper();
    e.type = type;
    e.revisions = revisions;
    e.dependencies = deps;
    e.detailLoaded = detailed;
    return e;
}

inline Hypernucleus::DepRef dep(const char* name, const char* version = "",
                                const char* source = "")
{
    return Hypernucleus::DepRef{name, version, source};
}
