#include "controllers/ArticleController.h"

namespace pyracms {

void ArticleController::listArticles(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    int limit = 20;
    int offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    if (!limitStr.empty()) limit = std::stoi(limitStr);
    if (!offsetStr.empty()) offset = std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();

    articleService_.listArticles(
        db, tenantId, limit, offset,
        [callback](const std::vector<ArticleDto> &articles) {
            Json::Value result(Json::arrayValue);
            for (const auto &a : articles) {
                Json::Value item;
                item["id"] = a.id;
                item["name"] = a.name;
                item["displayName"] = a.displayName;
                item["isPrivate"] = a.isPrivate;
                item["hideDisplayName"] = a.hideDisplayName;
                item["userId"] = a.userId;
                item["authorUsername"] = a.authorUsername;
                item["rendererName"] = a.rendererName;
                item["viewCount"] = a.viewCount;
                item["createdAt"] = a.createdAt;
                item["status"] = a.status;
                item["publishedAt"] = a.publishedAt;
                item["scheduledAt"] = a.scheduledAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
