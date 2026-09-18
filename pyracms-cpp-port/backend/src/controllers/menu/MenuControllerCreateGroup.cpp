#include "controllers/BoolReply.h"
#include "controllers/MenuController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void MenuController::createGroup(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tenantId") || !(*json).isMember("name")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenantId and name are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = (*json)["tenantId"].asInt();
    auto name = (*json)["name"].asString();

    auto db = drogon::app().getDbClient();
    menuService_.createMenuGroup(db, tenantId, name, boolReply(callback));
}

} // namespace pyracms
