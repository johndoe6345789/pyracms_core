#pragma once

#include <drogon/HttpFilter.h>
#include <functional>
#include <optional>

namespace pyracms {

// Requires role >= SiteAdmin. Chain after JwtAuthFilter.
class AdminFilter : public drogon::HttpFilter<AdminFilter> {
  public:
    // Resolves a user's raw role (nullopt = lookup failed). Defaults to the
    // users table; tests replace it.
    using RoleLookup = std::function<void(
        int userId, std::function<void(std::optional<int>)>)>;
    static RoleLookup &roleLookup();

    // True when userId owns tenantId. A site's owner administers that site
    // even though their stored role is only User.
    using OwnerLookup = std::function<void(
        int userId, int tenantId, std::function<void(bool)>)>;
    static OwnerLookup &ownerLookup();

    // Owner fallback: resolves the target row's own site (or the named
    // one for creates) and passes only when userId owns it.
    static void ownerFallback(const drogon::HttpRequestPtr &req, int userId,
                              drogon::FilterCallback &&fcb,
                              drogon::FilterChainCallback &&fccb);

    void doFilter(const drogon::HttpRequestPtr &req,
                  drogon::FilterCallback &&fcb,
                  drogon::FilterChainCallback &&fccb) override;
};

} // namespace pyracms
