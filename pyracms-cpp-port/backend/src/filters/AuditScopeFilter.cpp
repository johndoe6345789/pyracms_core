#include "filters/AuditScopeFilter.h"

#include "filters/TenantGuard.h"
#include "filters/TenantOfTarget.h"
#include "filters/TenantRules.h"

namespace pyracms {

void AuditScopeFilter::doFilter(const drogon::HttpRequestPtr &req,
                                drogon::FilterCallback &&,
                                drogon::FilterChainCallback &&fccb) {
    int categoryId = 0;
    if (auto body = req->getJsonObject()) {
        if (body->isMember("categoryId") && (*body)["categoryId"].isInt())
            categoryId = (*body)["categoryId"].asInt();
    }
    auto target = adminTargetOf(req->path(), categoryId);
    if (target.kind == AdminKind::None) {
        int t = scopeTenantOf(req);
        req->attributes()->insert(
            "auditTenant", t != 0 ? t : firstNamedTenant(namedTenants(req)));
        fccb();
        return;
    }
    // The row's own site is authoritative (a delete removes it later).
    tenantOfTarget()(target, [req, fccb = std::move(fccb)](
                                 bool, int tenant) mutable {
        req->attributes()->insert("auditTenant", tenant);
        fccb();
    });
}

} // namespace pyracms
