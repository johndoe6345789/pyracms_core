#pragma once

#include <drogon/HttpFilter.h>

namespace pyracms {

// Never refuses. Chained after AdminFilter on forum admin writes: records
// which site the action touches (request attribute "auditTenant") before
// the write runs, because a delete removes the row that names the site.
class AuditScopeFilter : public drogon::HttpFilter<AuditScopeFilter> {
  public:
    void doFilter(const drogon::HttpRequestPtr &req,
                  drogon::FilterCallback &&fcb,
                  drogon::FilterChainCallback &&fccb) override;
};

} // namespace pyracms
