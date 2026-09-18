#pragma once

#include "services/gamedep/GdTypes.h"
#include <vector>

namespace pyracms {

struct GdPageFilter {
    std::string type, name, q, tag; // "" = any
    bool publishedOnly{false};
    int limit{50}, offset{0};
};

using GdPages = std::vector<Json::Value>;

// Page JSON (revisions, binaries, deps, tags, shots) for a tenant scope.
void gdQueryPages(const GdCtx &c, const GdPageFilter &f,
                  std::function<void(const GdPages &)> ok, GdCb fail);
// Adds "pipRequirements" (["pkg==1"]) derived from pip dependencies.
void gdAddPip(Json::Value &page);

} // namespace pyracms
