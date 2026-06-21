#include "controllers/ArticleController.h"

namespace pyracms {

void ArticleController::listRevisions(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    // First find the article by name, then list revisions
    articleService_.getArticle(
        db, tenantId, name,
        [this, db, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.listRevisions(
                db, article->id,
                [callback](const std::vector<ArticleRevisionDto> &revisions) {
                    Json::Value result(Json::arrayValue);
                    for (const auto &r : revisions) {
                        Json::Value item;
                        item["id"] = r.id;
                        item["articleId"] = r.articleId;
                        item["content"] = r.content;
                        item["summary"] = r.summary;
                        item["userId"] = r.userId;
                        item["authorUsername"] = r.authorUsername;
                        item["createdAt"] = r.createdAt;
                        result.append(item);
                    }
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
