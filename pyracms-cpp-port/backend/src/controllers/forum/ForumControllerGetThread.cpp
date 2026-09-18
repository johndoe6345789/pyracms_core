#include "controllers/BoolReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// --- Threads ---
void ForumController::getThread(
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
    forumService_.getThread(
        db, id, tenantId,
        [callback](const std::optional<ForumThreadWithPostsDto> &threadData) {
            if (!threadData) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Thread not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = threadData->thread.id;
            result["name"] = threadData->thread.name;
            result["description"] = threadData->thread.description;
            result["forumId"] = threadData->thread.forumId;
            result["viewCount"] = threadData->thread.viewCount;
            result["totalPosts"] = threadData->thread.totalPosts;
            result["createdAt"] = threadData->thread.createdAt;
            result["userId"] = threadData->thread.userId;
            result["authorUsername"] = threadData->thread.authorUsername;
            result["lastPostAt"] = threadData->thread.lastPostAt;
            result["forumName"] = threadData->thread.forumName;
            result["pinned"] = threadData->thread.pinned;
            result["locked"] = threadData->thread.locked;

            Json::Value postsJson(Json::arrayValue);
            for (const auto &p : threadData->posts) {
                Json::Value postJson;
                postJson["id"] = p.id;
                postJson["title"] = p.title;
                postJson["content"] = p.content;
                postJson["createdAt"] = p.createdAt;
                postJson["userId"] = p.userId;
                postJson["username"] = p.username;
                postJson["threadId"] = p.threadId;
                postJson["likes"] = p.likes;
                postJson["dislikes"] = p.dislikes;
                postsJson.append(postJson);
            }
            result["posts"] = postsJson;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
