#include "controllers/CommentController.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"
#include "services/WebhookEvents.h"

namespace pyracms {

namespace {
using Reply = std::function<void(const drogon::HttpResponsePtr &)>;

void errorReply(const Reply &cb, const std::string &msg,
                drogon::HttpStatusCode c) {
    cb(filterError(msg, c));
}

void createdReply(const Reply &cb, int commentId) {
    Json::Value result;
    result["success"] = true;
    result["id"] = commentId;
    auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
    resp->setStatusCode(drogon::k201Created);
    cb(resp);
}
} // namespace

void CommentController::createComment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &contentType, int contentId) {

    auto userId = req->attributes()->get<int>("userId");
    auto json = req->getJsonObject();

    if (!json || !(*json).isMember("body"))
        return errorReply(callback, "body is required", drogon::k400BadRequest);
    if (!(*json)["body"].isString() || contentType.size() > 50 ||
        !isBoundedText((*json)["body"].asString(), 10000))
        return errorReply(callback,
                          "body must be text of at most 10000 characters",
                          drogon::k400BadRequest);
    auto body = (*json)["body"].asString();
    if (body.empty())
        return errorReply(callback, "body cannot be empty",
                          drogon::k400BadRequest);

    std::optional<int> parentId;
    if ((*json).isMember("parentId") && !(*json)["parentId"].isNull())
        parentId = (*json)["parentId"].asInt();

    auto db = drogon::app().getDbClient();
    int tenantId = req->attributes()->get<int>("tenantId");
    commentService_.createComment(
        db, userId, contentType, contentId, body, parentId,
        [this, db, userId, parentId, callback, tenantId, contentType,
         contentId](bool success, int commentId, const std::string &error) {
            if (!success)
                return errorReply(callback, error, drogon::k400BadRequest);
            fireCommentCreated(tenantId, contentType, contentId, userId,
                               commentId);
            if (!parentId.has_value())
                return createdReply(callback, commentId);
            // Reply notification for the parent comment owner.
            commentService_.findById(
                db, parentId.value(),
                [this, db, userId, commentId,
                 callback](const std::optional<CommentDto> &parent) {
                    if (parent && parent->userId != userId) {
                        notificationService_.createNotification(
                            db, parent->userId, "reply",
                            "New reply to your comment",
                            "Someone replied to your comment",
                            "/comments/" + std::to_string(commentId),
                            [](bool, const std::string &) {});
                    }
                    createdReply(callback, commentId);
                });
        });
}

} // namespace pyracms
