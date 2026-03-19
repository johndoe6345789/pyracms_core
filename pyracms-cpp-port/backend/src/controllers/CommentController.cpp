#include "controllers/CommentController.h"

namespace pyracms {

void CommentController::getComments(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &contentType,
    int contentId) {

    auto db = drogon::app().getDbClient();

    int limit = 50;
    int offset = 0;
    try {
        auto limitParam = req->getParameter("limit");
        if (!limitParam.empty()) limit = std::stoi(limitParam);
        auto offsetParam = req->getParameter("offset");
        if (!offsetParam.empty()) offset = std::stoi(offsetParam);
    } catch (...) {
        // Use defaults
    }

    if (limit > 200) limit = 200;
    if (limit < 1) limit = 1;

    commentService_.getComments(
        db, contentType, contentId, limit, offset,
        [callback](const std::vector<CommentDto> &comments) {
            Json::Value result(Json::arrayValue);
            for (const auto &c : comments) {
                Json::Value item;
                item["id"] = c.id;
                item["userId"] = c.userId;
                item["username"] = c.username;
                item["contentType"] = c.contentType;
                item["contentId"] = c.contentId;
                item["parentId"] = c.parentId;
                item["body"] = c.body;
                item["likes"] = c.likes;
                item["dislikes"] = c.dislikes;
                item["createdAt"] = c.createdAt;
                item["updatedAt"] = c.updatedAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void CommentController::createComment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &contentType,
    int contentId) {

    auto userId = req->attributes()->get<int>("userId");
    auto json = req->getJsonObject();

    if (!json || !(*json).isMember("body")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "body is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto body = (*json)["body"].asString();
    if (body.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "body cannot be empty";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    std::optional<int> parentId;
    if ((*json).isMember("parentId") && !(*json)["parentId"].isNull()) {
        parentId = (*json)["parentId"].asInt();
    }

    auto db = drogon::app().getDbClient();

    commentService_.createComment(
        db, userId, contentType, contentId, body, parentId,
        [this, db, userId, contentType, contentId, parentId, callback](
            bool success, int commentId, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            // Create notification for parent comment owner (reply notification)
            if (parentId.has_value()) {
                commentService_.findById(
                    db, parentId.value(),
                    [this, db, userId, commentId, callback](
                        const std::optional<CommentDto> &parentComment) {
                        if (parentComment && parentComment->userId != userId) {
                            notificationService_.createNotification(
                                db, parentComment->userId, "reply",
                                "New reply to your comment",
                                "Someone replied to your comment",
                                "/comments/" + std::to_string(commentId),
                                [](bool, const std::string &) {});
                        }

                        // Return success response
                        Json::Value result;
                        result["success"] = true;
                        result["id"] = commentId;
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
                        resp->setStatusCode(drogon::k201Created);
                        callback(resp);
                    });
            } else {
                Json::Value result;
                result["success"] = true;
                result["id"] = commentId;
                auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
                resp->setStatusCode(drogon::k201Created);
                callback(resp);
            }
        });
}

void CommentController::updateComment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto userId = req->attributes()->get<int>("userId");
    auto json = req->getJsonObject();

    if (!json || !(*json).isMember("body")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "body is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto body = (*json)["body"].asString();
    auto db = drogon::app().getDbClient();

    commentService_.updateComment(
        db, id, userId, body,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void CommentController::deleteComment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    commentService_.deleteComment(
        db, id, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void CommentController::voteComment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

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
        [this, db, id, userId, isLike, callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            // Create notification for comment owner on upvote
            if (isLike) {
                commentService_.findById(
                    db, id,
                    [this, db, userId, callback](
                        const std::optional<CommentDto> &comment) {
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
                        callback(drogon::HttpResponse::newHttpJsonResponse(result));
                    });
            } else {
                Json::Value result;
                result["success"] = true;
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
            }
        });
}

} // namespace pyracms
