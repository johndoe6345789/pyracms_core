#include "controllers/BoolReply.h"
#include "controllers/TenantController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void TenantController::create(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("slug") ||
        !(*json).isMember("displayName")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "slug and displayName required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto slug = (*json)["slug"].asString();
    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).get("description", "").asString();
    auto ownerId = req->attributes()->get<int>("userId");

    // Only platform accounts may create sites; a site's own accounts are
    // confined to that site.
    if (req->attributes()->get<int>("tenantId") != 0) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] =
            "Site accounts cannot create sites; use a platform account";
        resp->setStatusCode(drogon::k403Forbidden);
        callback(resp);
        return;
    }

    auto db = drogon::app().getDbClient();
    tenantService_.createTenant(
        db, slug, displayName, description, ownerId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k409Conflict);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
