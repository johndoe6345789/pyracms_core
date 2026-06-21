#include "controllers/ArticleController.h"

namespace pyracms {

void ArticleController::setTags(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tags") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tags and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    std::vector<std::string> tags;
    for (const auto &tag : (*json)["tags"]) {
        tags.push_back(tag.asString());
    }
    int tenantId = (*json)["tenant_id"].asInt();
    auto db = drogon::app().getDbClient();

    articleService_.getArticle(
        db, tenantId, name,
        [this, db, tags, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.setTags(
                db, article->id, tags,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["message"] = "Tags updated";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
