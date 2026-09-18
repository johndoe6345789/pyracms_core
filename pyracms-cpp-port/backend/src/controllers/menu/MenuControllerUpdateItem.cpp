#include "controllers/BoolReply.h"
#include "controllers/MenuController.h"
#include "filters/TenantGuard.h"

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

    Json::Value upd = *json;
    // Scoped accounts may not move an item into another group
    if (tokenTenantOf(req) != 0)
        upd.removeMember("groupId");
    auto db = drogon::app().getDbClient();
    menuService_.updateMenuItem(db, id, upd, tokenTenantOf(req),
                                boolReply(callback));
}

} // namespace pyracms
