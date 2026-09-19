#include "controllers/ArticleController.h"
#include "controllers/ArticleInput.h"
#include "security/Validate.h"

namespace pyracms {

void ArticleController::createArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name") || !(*json).isMember("displayName") ||
        !(*json).isMember("content") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "name, displayName, content, and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    if (!(*json)["name"].isString() || !(*json)["displayName"].isString() ||
        !(*json)["content"].isString() ||
        !(*json).get("renderer", "markdown").isString()) {
        callback(articleBad("name, displayName and content must be text"));
        return;
    }
    auto name = (*json)["name"].asString();
    auto displayName = (*json)["displayName"].asString();
    auto content = (*json)["content"].asString();
    auto renderer = (*json).get("renderer", "markdown").asString();
    if (!isSafeName(name) || !isBoundedText(displayName, 256) ||
        !isBoundedText(content, kMaxArticleBytes) ||
        !isKnownRenderer(renderer)) {
        callback(articleBad("Invalid article name, content or renderer"));
        return;
    }
    int tenantId = (*json)["tenant_id"].asInt();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    articleService_.createArticle(
        db, tenantId, name, displayName, content, renderer, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k409Conflict);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Article created";
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
