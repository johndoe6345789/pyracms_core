#include "filters/ArticleWriteGate.h"

#include "filters/AdminFilter.h"
#include "filters/RoleRules.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void mayWriteArticles(const drogon::HttpRequestPtr &req, int tenantId,
                      std::function<void(bool)> done) {
    auto attrs = req->attributes();
    if (attrs->find("role") &&
        roleAllows(attrs->get<int>("role"), UserRole::Moderator)) {
        done(true);
        return;
    }
    if (!attrs->find("userId")) {
        done(false);
        return;
    }
    AdminFilter::ownerLookup()(attrs->get<int>("userId"), tenantId,
                               std::move(done));
}

drogon::HttpResponsePtr articleForbidden() {
    return filterError("Writing articles needs Moderator level",
                       drogon::k403Forbidden);
}

} // namespace pyracms
