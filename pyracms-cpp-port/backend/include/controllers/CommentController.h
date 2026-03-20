#pragma once

#include <drogon/HttpController.h>
#include "services/CommentService.h"
#include "services/NotificationService.h"
#include "services/UserService.h"

namespace pyracms {

class CommentController : public drogon::HttpController<CommentController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(CommentController::getComments, "/api/comments/{contentType}/{contentId}", drogon::Get);
    ADD_METHOD_TO(CommentController::createComment, "/api/comments/{contentType}/{contentId}", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CommentController::updateComment, "/api/comments/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CommentController::deleteComment, "/api/comments/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CommentController::voteComment, "/api/comments/{id}/vote", drogon::Post, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void getComments(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     const std::string &contentType,
                     int contentId);

    void createComment(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &contentType,
                       int contentId);

    void updateComment(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       int id);

    void deleteComment(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       int id);

    void voteComment(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     int id);

private:
    CommentService commentService_;
    NotificationService notificationService_;
    UserService userService_;
};

} // namespace pyracms
