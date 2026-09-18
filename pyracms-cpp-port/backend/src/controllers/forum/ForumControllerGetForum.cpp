#include "controllers/BoolReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// --- Forums ---
void ForumController::getForum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    int tenantId = 0;
    auto tenantParam = req->getParameter("tenant_id");
    if (!tenantParam.empty()) {
        try {
            tenantId = std::stoi(tenantParam);
        } catch (...) {
        }
    }
    auto db = drogon::app().getDbClient();
    forumService_.getForum(
        db, id, tenantId,
        [callback](const std::optional<ForumWithThreadsDto> &forumData) {
            if (!forumData) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Forum not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = forumData->forum.id;
            result["name"] = forumData->forum.name;
            result["description"] = forumData->forum.description;
            result["categoryId"] = forumData->forum.categoryId;
            result["totalThreads"] = forumData->forum.totalThreads;
            result["totalPosts"] = forumData->forum.totalPosts;

            Json::Value threadsJson(Json::arrayValue);
            for (const auto &t : forumData->threads) {
                Json::Value threadJson;
                threadJson["id"] = t.id;
                threadJson["name"] = t.name;
                threadJson["description"] = t.description;
                threadJson["forumId"] = t.forumId;
                threadJson["viewCount"] = t.viewCount;
                threadJson["totalPosts"] = t.totalPosts;
                threadJson["createdAt"] = t.createdAt;
                threadJson["userId"] = t.userId;
                threadJson["authorUsername"] = t.authorUsername;
                threadJson["lastPostAt"] = t.lastPostAt;
                threadJson["pinned"] = t.pinned;
                threadJson["locked"] = t.locked;
                threadsJson.append(threadJson);
            }
            result["threads"] = threadsJson;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
