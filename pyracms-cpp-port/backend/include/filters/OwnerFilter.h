#pragma once

#include "filters/OwnerRules.h"

#include <drogon/HttpFilter.h>
#include <functional>
#include <optional>

namespace pyracms {

// Object-level authorisation for by-name / by-id write routes. Chain after
// JwtAuthFilter. Unknown rows answer 404, foreign rows 403.
class OwnerFilter : public drogon::HttpFilter<OwnerFilter> {
  public:
    using RowCb = std::function<void(bool ok, std::optional<OwnedRow>)>;
    // (resource, key, named tenant, actor id) -> row. Tests replace it.
    using RowLookup =
        std::function<void(Resource, const std::string &, int, int, RowCb)>;
    static RowLookup &rowLookup();

    void doFilter(const drogon::HttpRequestPtr &req,
                  drogon::FilterCallback &&fcb,
                  drogon::FilterChainCallback &&fccb) override;
};

} // namespace pyracms
