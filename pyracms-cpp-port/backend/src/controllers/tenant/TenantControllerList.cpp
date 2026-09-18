#include "controllers/BoolReply.h"
#include "controllers/TenantController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void TenantController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto db = drogon::app().getDbClient();
    tenantService_.listTenants(
        db, [callback](const std::vector<TenantDto> &tenants) {
            Json::Value result(Json::arrayValue);
            for (const auto &t : tenants) {
                Json::Value item;
                item["id"] = t.id;
                item["slug"] = t.slug;
                item["displayName"] = t.displayName;
                item["description"] = t.description;
                item["ownerId"] = t.ownerId;
                item["createdAt"] = t.createdAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
