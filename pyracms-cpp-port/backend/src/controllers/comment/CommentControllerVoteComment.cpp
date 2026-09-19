#include "controllers/CommentController.h"
#include "security/Validate.h"

namespace pyracms {

void CommentController::voteComment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto userId = req->attributes()->get<int>("userId");
    auto json = req->getJsonObject();

    if (!json || !(*json).isMember("isLike")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "isLike is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    bool isLike = (*json)["isLike"].asBool();
    auto db = drogon::app().getDbClient();

    commentService_.voteComment(
        db, id, userId, isLike,
        [this, db, id, userId, isLike, callback](bool success,
                                                 const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            // Create notification for comment owner on upvote
            if (isLike) {
                commentService_.findById(
                    db, id,
                    [this, db, userId,
                     callback](const std::optional<CommentDto> &comment) {
                        if (comment && comment->userId != userId) {
                            notificationService_.createNotification(
                                db, comment->userId, "vote",
                                "Your comment was liked",
                                "Someone liked your comment",
                                "/comments/" + std::to_string(comment->id),
                                [](bool, const std::string &) {});
                        }
                        Json::Value result;
                        result["success"] = true;
                        callback(
                            drogon::HttpResponse::newHttpJsonResponse(result));
                    });
            } else {
                Json::Value result;
                result["success"] = true;
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
            }
        });
}

} // namespace pyracms
