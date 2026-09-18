#include "controllers/BoolReply.h"
#include "controllers/MenuController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void MenuController::listItems(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto db = drogon::app().getDbClient();
    menuService_.listMenuItems(
        db, id, [callback](const std::vector<MenuItemDto> &items) {
            Json::Value result(Json::arrayValue);
            for (const auto &i : items) {
                Json::Value item;
                item["id"] = i.id;
                item["name"] = i.name;
                item["routePath"] = i.routePath;
                item["url"] = i.url;
                item["type"] = i.type;
                item["groupId"] = i.groupId;
                item["position"] = i.position;
                item["permissions"] = i.permissions;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
