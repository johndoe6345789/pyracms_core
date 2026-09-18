#include "filters/AdminFilter.h"

#include "filters/RoleRules.h"
#include "filters/TenantGuard.h"

#include <drogon/drogon.h>

namespace pyracms {

AdminFilter::RoleLookup &AdminFilter::roleLookup() {
    static RoleLookup lookup = [](int userId,
                                  std::function<void(std::optional<int>)> cb) {
        drogon::app().getDbClient()->execSqlAsync(
            "SELECT role FROM users WHERE id = $1",
            [cb](const drogon::orm::Result &r) {
                cb(r.empty() ? std::optional<int>(0)
                             : std::optional<int>(r[0]["role"].as<int>()));
            },
            [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
            userId);
    };
    return lookup;
}

void AdminFilter::doFilter(const drogon::HttpRequestPtr &req,
                           drogon::FilterCallback &&fcb,
                           drogon::FilterChainCallback &&fccb) {
    auto attrs = req->attributes();
    if (!attrs->find("userId")) {
        fcb(filterError("Authentication required", drogon::k401Unauthorized));
        return;
    }
    roleLookup()(attrs->get<int>("userId"), [fcb, fccb](std::optional<int> r) {
        if (!r) {
            fcb(filterError("Role lookup failed",
                            drogon::k500InternalServerError));
        } else if (roleAllows(*r, UserRole::SiteAdmin)) {
            fccb();
        } else {
            fcb(filterError("Site admin role required", drogon::k403Forbidden));
        }
    });
}

} // namespace pyracms
