#pragma once

#include "Fixture.h"
#include "domain/BinarySelector.h"
#include "domain/CatalogParser.h"

// The demo game with binaries (backend shape) and per-platform selection.
inline Hypernucleus::GameEntry bbGame()
{
    return Hypernucleus::CatalogParser::parseCatalog(
               fixtureJson("catalog_binaries.json"))
        .first();
}

inline Hypernucleus::DownloadTarget bbPick(const QString& os,
                                           const QString& arch)
{
    const Hypernucleus::GameEntry g = bbGame();
    return Hypernucleus::BinarySelector::resolveTarget(g.revisions.first(),
                                                       "game", os, arch);
}
