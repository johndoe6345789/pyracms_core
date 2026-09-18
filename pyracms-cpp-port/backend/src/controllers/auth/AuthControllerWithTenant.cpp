#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Accounts are scoped per tenant. The optional "tenant" field (a slug)
// selects the scope; absent/empty means the platform scope (portal
// accounts, site owners, super-admins). Calls `next(tenantId, slug)` with
// tenantId 0 for the platform, or replies 404 for an unknown slug.
void AuthController::withTenant(
    const Json::Value &json,
    const std::function<void(const drogon::HttpResponsePtr &)> &callback,
    std::function<void(int, const std::string &)> next) {
    auto slug = json.get("tenant", "").asString();
    if (slug.empty()) {
        next(0, "");
        return;
    }
    tenantService_.findBySlug(
        drogon::app().getDbClient(), slug,
        [callback, next, slug](const std::optional<TenantDto> &tenant) {
            if (!tenant) {
                sendError(callback, "Unknown site: " + slug,
                          drogon::k404NotFound);
                return;
            }
            next(tenant->id, tenant->slug);
        });
}

} // namespace pyracms
