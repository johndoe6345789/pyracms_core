#include "controllers/ArticleTagController.h"

namespace pyracms {

void ArticleTagController::listTagCloud(
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

    auto db = drogon::app().getDbClient();
    articleTagService_.listTagCloud(
        db,
        std::stoi(tenantIdStr),
        [callback](const std::vector<ArticleTagCloudItem> &tags) {
            Json::Value result(Json::arrayValue);
            for (const auto &tag : tags) {
                Json::Value item;
                item["name"] = tag.name;
                item["count"] = tag.count;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
