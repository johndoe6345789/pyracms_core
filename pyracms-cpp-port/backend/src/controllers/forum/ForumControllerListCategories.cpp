#include "controllers/BoolReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// --- Categories ---
void ForumController::listCategories(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id parameter is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    forumService_.listCategories(
        db, tenantId,
        [callback](const std::vector<ForumCategoryWithForumsDto> &categories) {
            Json::Value result(Json::arrayValue);
            for (const auto &cat : categories) {
                Json::Value catJson;
                catJson["id"] = cat.category.id;
                catJson["name"] = cat.category.name;

                Json::Value forumsJson(Json::arrayValue);
                for (const auto &f : cat.forums) {
                    Json::Value forumJson;
                    forumJson["id"] = f.id;
                    forumJson["name"] = f.name;
                    forumJson["description"] = f.description;
                    forumJson["categoryId"] = f.categoryId;
                    forumJson["totalThreads"] = f.totalThreads;
                    forumJson["totalPosts"] = f.totalPosts;
                    forumsJson.append(forumJson);
                }
                catJson["forums"] = forumsJson;
                result.append(catJson);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
