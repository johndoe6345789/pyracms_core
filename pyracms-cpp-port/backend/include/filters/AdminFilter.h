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

    void doFilter(const drogon::HttpRequestPtr &req,
                  drogon::FilterCallback &&fcb,
                  drogon::FilterChainCallback &&fccb) override;
};

} // namespace pyracms
