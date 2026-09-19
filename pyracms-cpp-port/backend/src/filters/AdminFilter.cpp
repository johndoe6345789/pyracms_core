#include "filters/AdminFilter.h"

#include "filters/RoleRules.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"

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

AdminFilter::OwnerLookup &AdminFilter::ownerLookup() {
    static OwnerLookup lookup = [](int userId, int tenantId,
                                   std::function<void(bool)> cb) {
        drogon::app().getDbClient()->execSqlAsync(
            "SELECT 1 FROM tenants WHERE id = $1 AND owner_id = $2",
            [cb](const drogon::orm::Result &r) { cb(!r.empty()); },
            [cb](const drogon::orm::DrogonDbException &) { cb(false); },
            tenantId, userId);
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
    int userId = attrs->get<int>("userId");
    std::vector<std::string> named{req->getParameter("tenant_id"),
                                   req->getParameter("tenantId")};
    if (auto body = req->getJsonObject()) {
        for (const char *k : {"tenant_id", "tenantId"}) {
            if (body->isMember(k))
                named.push_back((*body)[k].asString());
        }
    }
    int tenant = firstNamedTenant(named);
    roleLookup()(userId, [=](std::optional<int> r) {
        if (!r) {
            fcb(filterError("Role lookup failed",
                            drogon::k500InternalServerError));
        } else if (roleAllows(*r, UserRole::SiteAdmin)) {
            fccb();
        } else if (tenant == 0) {
            fcb(filterError("Site admin role required", drogon::k403Forbidden));
        } else {
            ownerLookup()(userId, tenant, [=](bool owner) {
                if (owner)
                    fccb();
                else
                    fcb(filterError("Site admin role required",
                                    drogon::k403Forbidden));
            });
        }
    });
}

} // namespace pyracms
