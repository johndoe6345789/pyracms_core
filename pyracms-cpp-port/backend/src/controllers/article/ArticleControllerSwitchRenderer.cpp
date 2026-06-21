#include "controllers/ArticleController.h"

namespace pyracms {

void ArticleController::switchRenderer(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("renderer") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "renderer and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto renderer = (*json)["renderer"].asString();
    int tenantId = (*json)["tenant_id"].asInt();
    auto db = drogon::app().getDbClient();

    // Find article by name first
    articleService_.getArticle(
        db, tenantId, name,
        [this, db, renderer, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.switchRenderer(
                db, article->id, renderer,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["message"] = "Renderer updated";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
