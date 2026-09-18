#include "controllers/BoolReply.h"
#include "controllers/TenantController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void TenantController::remove(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    // Site accounts are confined to their own site and cannot delete it.
    if (tokenTenantOf(req) != 0) {
        callback(filterError("Site accounts cannot delete sites",
                             drogon::k403Forbidden));
        return;
    }
    tenantService_.deleteTenant(drogon::app().getDbClient(), id,
                                req->attributes()->get<int>("userId"),
                                boolReply(callback));
}

} // namespace pyracms
