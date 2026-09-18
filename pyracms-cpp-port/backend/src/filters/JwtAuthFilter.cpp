#include "filters/JwtAuthFilter.h"

#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"

namespace pyracms {

void JwtAuthFilter::doFilter(const drogon::HttpRequestPtr &req,
                             drogon::FilterCallback &&fcb,
                             drogon::FilterChainCallback &&fccb) {
    auto header = req->getHeader("Authorization");
    if (header.substr(0, 7) != "Bearer ") {
        fcb(filterError("Missing or invalid Authorization header",
                        drogon::k401Unauthorized));
        return;
    }
    auto payload = authService_.verifyToken(header.substr(7));
    if (!payload) {
        fcb(filterError("Invalid or expired token", drogon::k401Unauthorized));
        return;
    }
    req->attributes()->insert("userId", payload->userId);
    req->attributes()->insert("username", payload->username);
    req->attributes()->insert("tenantId", payload->tenantId);

    // A tenant-scoped account may only act inside its own tenant.
    if (namesForeignTenant(payload->tenantId, namedTenants(req))) {
        fcb(filterError("This account belongs to a different site",
                        drogon::k403Forbidden));
        return;
    }
    fccb();
}

} // namespace pyracms
