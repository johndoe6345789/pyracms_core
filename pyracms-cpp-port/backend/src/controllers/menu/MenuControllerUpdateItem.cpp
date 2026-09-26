#include "controllers/BoolReply.h"
#include "controllers/MenuController.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"
#include "security/IconName.h"

namespace pyracms {

void MenuController::updateItem(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto json = req->getJsonObject();
    if (!json) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Invalid JSON body";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    for (const char *k : {"url", "routePath"}) {
        if (json->isMember(k) && (!(*json)[k].isString() ||
                                  !isSafeLinkUrl((*json)[k].asString()))) {
            callback(filterError("Invalid menu link",
                                 drogon::k400BadRequest));
            return;
        }
    }
    if (json->isMember("icon") &&
        (!(*json)["icon"].isString() ||
         !isSafeIconName((*json)["icon"].asString())))
        return callback(
            filterError("Invalid icon name", drogon::k400BadRequest));
    Json::Value upd = *json;
    // Scoped accounts may not move an item into another group
    if (scopeTenantOf(req) != 0)
        upd.removeMember("groupId");
    auto db = drogon::app().getDbClient();
    menuService_.updateMenuItem(db, id, upd, scopeTenantOf(req),
                                boolReply(callback));
}

} // namespace pyracms
