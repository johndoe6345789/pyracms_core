#include "controllers/ArticleController.h"

namespace pyracms {

void ArticleController::deleteArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto json = req->getJsonObject();
        if (!json || !(*json).isMember("tenant_id")) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "tenant_id is required";
            resp->setStatusCode(drogon::k400BadRequest);
            callback(resp);
            return;
        }
        int tenantId = (*json)["tenant_id"].asInt();
        auto db = drogon::app().getDbClient();

        articleService_.deleteArticle(
            db, tenantId, name,
            [callback](bool success, const std::string &error) {
                if (!success) {
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                    (*resp->jsonObject())["error"] = error;
                    resp->setStatusCode(drogon::k404NotFound);
                    callback(resp);
                    return;
                }

                Json::Value result;
                result["message"] = "Article deleted";
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
            });
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    articleService_.deleteArticle(
        db, tenantId, name,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Article deleted";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
