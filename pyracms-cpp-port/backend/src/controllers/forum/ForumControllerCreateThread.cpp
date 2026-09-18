#include "controllers/BoolReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void ForumController::createThread(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("forumId") || !(*json).isMember("title") ||
        !(*json).isMember("content")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] =
            "forumId, title, and content are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int forumId = (*json)["forumId"].asInt();
    auto title = (*json)["title"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";
    auto content = (*json)["content"].asString();
    int tenantId =
        (*json).isMember("tenantId") ? (*json)["tenantId"].asInt() : 0;
    if (title.empty() || content.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "title and content must not be empty";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    forumService_.createThread(
        db, forumId, title, description, content, userId, tenantId,
        [callback](int newId, const std::string &error) {
            if (newId <= 0) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            result["id"] = newId;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
