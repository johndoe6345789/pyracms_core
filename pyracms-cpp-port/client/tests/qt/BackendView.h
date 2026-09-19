#pragma once

#include "Fixture.h"
#include "domain/CatalogParser.h"
#include "viewmodels/SelectedGameView.h"

inline Hypernucleus::GameEntry bvSnake()
{
    return Hypernucleus::CatalogParser::parseCatalog(
               fixtureJson("catalog_binaries.json"))
        .first();
}

// The detail page data of `e` on this platform.
inline QVariantMap bvView(const Hypernucleus::GameEntry& e, const QString& os,
                          const QString& arch)
{
    Hypernucleus::SelectedGameView::Input in;
    in.entry = &e;
    in.os = os;
    in.arch = arch;
    return Hypernucleus::SelectedGameView::build(in);
}
