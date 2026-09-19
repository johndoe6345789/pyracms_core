#include "controllers/ArticleController.h"
#include "controllers/ArticleInput.h"
#include "security/Validate.h"
#include "services/WebhookEvents.h"

namespace pyracms {

void ArticleController::updateArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("content") ||
        !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "content and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    if (!(*json)["content"].isString() ||
        !(*json).get("summary", "").isString() ||
        !isBoundedText((*json)["content"].asString(), kMaxArticleBytes) ||
        !isBoundedText((*json).get("summary", "").asString(), 500)) {
        callback(articleBad("Invalid content or summary"));
        return;
    }
    auto content = (*json)["content"].asString();
    auto summary = (*json).get("summary", "").asString();
    int tenantId = (*json)["tenant_id"].asInt();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    articleService_.updateArticle(
        db, tenantId, name, content, summary, userId,
        [callback, tenantId, name, userId](bool success,
                             const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value d;
            d["name"] = name;
            d["userId"] = userId;
            fireWebhookEvent(tenantId, "article.updated", d);
            Json::Value result;
            result["message"] = "Article updated";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
