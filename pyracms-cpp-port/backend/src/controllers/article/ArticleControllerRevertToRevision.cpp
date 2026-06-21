#include "controllers/ArticleController.h"

namespace pyracms {

void ArticleController::revertToRevision(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name,
    const std::string &revId) {

    auto tenantIdStr = req->getParameter("tenant_id");
    auto json = req->getJsonObject();
    int tenantId = 0;
    if (!tenantIdStr.empty()) {
        tenantId = std::stoi(tenantIdStr);
    } else if (json && (*json).isMember("tenant_id")) {
        tenantId = (*json)["tenant_id"].asInt();
    } else {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int revisionId = std::stoi(revId);
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    // Find article by name first
    articleService_.getArticle(
        db, tenantId, name,
        [this, db, revisionId, userId, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.revertToRevision(
                db, article->id, revisionId, userId,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k404NotFound);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["message"] = "Article reverted";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
