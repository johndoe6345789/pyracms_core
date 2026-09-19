#include "filters/OwnerFilter.h"

#include "filters/TenantGuard.h"
#include "security/Validate.h"

#include <drogon/drogon.h>

namespace pyracms {

void OwnerFilter::doFilter(const drogon::HttpRequestPtr &req,
                           drogon::FilterCallback &&fcb,
                           drogon::FilterChainCallback &&fccb) {
    auto attrs = req->attributes();
    auto target = targetOf(req->path());
    if (!attrs->find("userId") || target.kind == Resource::None) {
        fcb(filterError("Authentication required", drogon::k401Unauthorized));
        return;
    }
    int actor = attrs->get<int>("userId");
    int role = attrs->find("role") ? attrs->get<int>("role") : 0;
    int actorTenant = tokenTenantOf(req);
    int named = firstNamedTenant(namedTenants(req));
    bool byId = target.kind != Resource::Article &&
                target.kind != Resource::File;
    int idCheck = 0;
    if ((byId && !parseId(target.key, idCheck)) ||
        (target.kind == Resource::File && !isValidUuid(target.key))) {
        fcb(filterError("Not found", drogon::k404NotFound));
        return;
    }
    if (target.kind == Resource::Article && named == 0) {
        fcb(filterError("tenant_id is required", drogon::k400BadRequest));
        return;
    }
    rowLookup()(target.kind, target.key, named, actor,
                [=, fcb = std::move(fcb), fccb = std::move(fccb)](
                    bool ok, std::optional<OwnedRow> row) {
                    if (!ok) {
                        fcb(filterError("Authorisation unavailable",
                                        drogon::k503ServiceUnavailable));
                    } else if (!row) {
                        fcb(filterError("Not found", drogon::k404NotFound));
                    } else if (!writeAllowed(target.kind, role, actor,
                                             actorTenant, *row)) {
                        fcb(filterError("You may not change this item",
                                        drogon::k403Forbidden));
                    } else {
                        fccb();
                    }
                });
}

} // namespace pyracms
