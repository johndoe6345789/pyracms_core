#include "controllers/BoolReply.h"
#include "controllers/MenuController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void MenuController::deleteGroup(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto db = drogon::app().getDbClient();
    menuService_.deleteMenuGroup(db, id, scopeTenantOf(req),
                                 boolReply(callback));
}

} // namespace pyracms
