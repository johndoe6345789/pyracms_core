#include "filters/AdminFilter.h"
#include "filters/TenantGuard.h"
#include "filters/TenantOfTarget.h"
#include "filters/TenantRules.h"

namespace pyracms {

// A site owner keeps the stored role User, so they are recognised by
// ownership of the row's site. That site comes from the row itself; a
// tenant named by the caller may only agree with it (never widen it).
void AdminFilter::ownerFallback(const drogon::HttpRequestPtr &req, int userId,
                                drogon::FilterCallback &&fcb,
                                drogon::FilterChainCallback &&fccb) {
    int named = firstNamedTenant(namedTenants(req));
    int categoryId = 0;
    if (auto body = req->getJsonObject()) {
        if (body->isMember("categoryId") && (*body)["categoryId"].isInt())
            categoryId = (*body)["categoryId"].asInt();
    }
    auto target = adminTargetOf(req->path(), categoryId);
    bool hasTarget = target.kind != AdminKind::None;
    auto refuse = [](drogon::FilterCallback &f, int status) {
        f(status == 404
              ? filterError("Not found", drogon::k404NotFound)
              : filterError("Site admin role required",
                            drogon::k403Forbidden));
    };
    auto decide = [=, fcb = std::move(fcb), fccb = std::move(fccb)](
                      bool ok, int resolved) mutable {
        if (!ok)
            return fcb(filterError("Authorisation unavailable",
                                   drogon::k503ServiceUnavailable));
        auto pick = chooseTenant(hasTarget, resolved, named);
        if (pick.status != 0)
            return refuse(fcb, pick.status);
        ownerLookup()(userId, pick.tenant, [=](bool owner) mutable {
            if (!owner)
                return refuse(fcb, 403);
            req->attributes()->insert("scopeTenant", pick.tenant);
            fccb();
        });
    };
    if (hasTarget)
        tenantOfTarget()(target, std::move(decide));
    else
        decide(true, 0);
}

} // namespace pyracms
