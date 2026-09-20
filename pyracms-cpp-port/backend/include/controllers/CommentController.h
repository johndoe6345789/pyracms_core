#pragma once

#include "services/CommentService.h"
#include "services/NotificationService.h"
#include "services/UserService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class CommentController : public drogon::HttpController<CommentController> {
  public:
    METHOD_LIST_BEGIN
    // Regex routes: a numeric first segment is a comment id, so
    // "/api/comments/{id}/vote" must not match {contentType}/{contentId}.
    ADD_METHOD_VIA_REGEX(CommentController::getComments,
                         "/api/comments/([A-Za-z_-]+)/([0-9]+)", drogon::Get);
    ADD_METHOD_VIA_REGEX(CommentController::createComment,
                         "/api/comments/([A-Za-z_-]+)/([0-9]+)", drogon::Post,
                         "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CommentController::updateComment, "/api/comments/{id}",
                  drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CommentController::deleteComment, "/api/comments/{id}",
                  drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CommentController::voteComment, "/api/comments/{id}/vote",
                  drogon::Post, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void
    getComments(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                const std::string &contentType, int contentId);

    void createComment(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
        const std::string &contentType, int contentId);

    void updateComment(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
        int id);

    void deleteComment(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
        int id);

    void
    voteComment(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                int id);

  private:
    void storeComment(
        int userId, int tenantId, const std::string &contentType,
        int contentId, const std::string &body, std::optional<int> parentId,
        std::function<void(const drogon::HttpResponsePtr &)> callback);
    CommentService commentService_;
    NotificationService notificationService_;
    UserService userService_;
};

} // namespace pyracms
