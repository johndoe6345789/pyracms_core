#include "controllers/BoolReply.h"
#include "controllers/MenuController.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"
#include "security/IconName.h"

namespace pyracms {

void MenuController::createItem(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "name is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto name = (*json)["name"].asString();
    auto routePath = (*json).get("routePath", "").asString();
    auto url = (*json).get("url", "").asString();
    if (!isSafeLinkUrl(url) || !isSafeLinkUrl(routePath) ||
        name.size() > 128) {
        callback(filterError("Invalid menu item name or link",
                             drogon::k400BadRequest));
        return;
    }
    auto type = (*json).get("type", "route").asString();
    int position = (*json).get("position", 0).asInt();
    auto permissions = (*json).get("permissions", "").asString();
    int parentId = (*json).get("parentId", 0).asInt();
    auto icon = (*json).get("icon", "").asString();
    if (!isSafeIconName(icon))
        return callback(
            filterError("Invalid icon name", drogon::k400BadRequest));

    auto db = drogon::app().getDbClient();
    menuService_.createMenuItem(db, name, routePath, url, type, id, position,
                                permissions, parentId, icon, scopeTenantOf(req),
                                boolReply(callback));
}

} // namespace pyracms
