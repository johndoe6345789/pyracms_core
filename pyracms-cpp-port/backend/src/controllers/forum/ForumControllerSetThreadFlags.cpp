#include "controllers/BoolReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void ForumController::setThreadFlags(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("pinned") || !(*json).isMember("locked")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "pinned and locked are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    bool pinned = (*json)["pinned"].asBool();
    bool locked = (*json)["locked"].asBool();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    forumService_.setThreadFlags(
        db, id, userId, pinned, locked,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k403Forbidden);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
