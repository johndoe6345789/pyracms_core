#include "controllers/AuditReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void ForumController::createCategory(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name") || !(*json).isMember("tenantId")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "name and tenantId are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto name = (*json)["name"].asString();
    int tenantId = (*json)["tenantId"].asInt();
    auto db = drogon::app().getDbClient();

    forumService_.createCategory(
        db, tenantId, name,
        auditedReply(req, callback, "category.create", name));
}

} // namespace pyracms
