#include "controllers/BoolReply.h"
#include "controllers/TenantController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void TenantController::getBySlug(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &slug) {

    auto db = drogon::app().getDbClient();
    tenantService_.findBySlug(
        db, slug, [callback](const std::optional<TenantDto> &tenant) {
            if (!tenant) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Tenant not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = tenant->id;
            result["slug"] = tenant->slug;
            result["displayName"] = tenant->displayName;
            result["description"] = tenant->description;
            result["ownerId"] = tenant->ownerId;
            result["createdAt"] = tenant->createdAt;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
