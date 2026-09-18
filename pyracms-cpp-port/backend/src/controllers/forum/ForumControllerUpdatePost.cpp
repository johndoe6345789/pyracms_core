#include "controllers/BoolReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void ForumController::updatePost(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("content")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "content is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto title = (*json).isMember("title") ? (*json)["title"].asString() : "";
    auto content = (*json)["content"].asString();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    forumService_.updatePost(
        db, id, userId, title, content,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
