#include "controllers/BoolReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void ForumController::getPostById(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto db = drogon::app().getDbClient();
    forumService_.getPost(
        db, id, [callback](const std::optional<ForumPostDto> &post) {
            if (!post) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Post not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = post->id;
            result["title"] = post->title;
            result["content"] = post->content;
            result["createdAt"] = post->createdAt;
            result["userId"] = post->userId;
            result["username"] = post->username;
            result["threadId"] = post->threadId;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
