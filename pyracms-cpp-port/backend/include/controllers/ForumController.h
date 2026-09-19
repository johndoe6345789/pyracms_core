#pragma once

#include "controllers/HttpAliases.h"
#include "services/ForumService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class ForumController : public drogon::HttpController<ForumController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ForumController::listCategories, "/api/forum/categories",
                  drogon::Get);
    ADD_METHOD_TO(ForumController::createCategory, "/api/forum/categories",
                  drogon::Post, PYR_JWT, PYR_ADMIN, PYR_AUDIT);
    ADD_METHOD_TO(ForumController::updateCategory, "/api/forum/categories/{id}",
                  drogon::Put, PYR_JWT, PYR_ADMIN);
    ADD_METHOD_TO(ForumController::deleteCategory, "/api/forum/categories/{id}",
                  drogon::Delete, PYR_JWT, PYR_ADMIN, PYR_AUDIT);
    ADD_METHOD_TO(ForumController::getForum, "/api/forum/forums/{id}",
                  drogon::Get);
    ADD_METHOD_TO(ForumController::createForum, "/api/forum/forums",
                  drogon::Post, PYR_JWT, PYR_ADMIN, PYR_AUDIT);
    ADD_METHOD_TO(ForumController::updateForum, "/api/forum/forums/{id}",
                  drogon::Put, PYR_JWT, PYR_ADMIN);
    ADD_METHOD_TO(ForumController::deleteForum, "/api/forum/forums/{id}",
                  drogon::Delete, PYR_JWT, PYR_ADMIN, PYR_AUDIT);
    ADD_METHOD_TO(ForumController::getThread, "/api/forum/threads/{id}",
                  drogon::Get);
    ADD_METHOD_TO(ForumController::createThread, "/api/forum/threads",
                  drogon::Post, PYR_JWT);
    ADD_METHOD_TO(ForumController::updateThread, "/api/forum/threads/{id}",
                  drogon::Put, PYR_JWT);
    ADD_METHOD_TO(ForumController::deleteThread, "/api/forum/threads/{id}",
                  drogon::Delete, PYR_JWT);
    ADD_METHOD_TO(ForumController::setThreadFlags,
                  "/api/forum/threads/{id}/flags", drogon::Put, PYR_JWT);
    ADD_METHOD_TO(ForumController::createPost, "/api/forum/posts", drogon::Post,
                  PYR_JWT);
    ADD_METHOD_TO(ForumController::getPostById, "/api/forum/posts/{id}",
                  drogon::Get);
    ADD_METHOD_TO(ForumController::updatePost, "/api/forum/posts/{id}",
                  drogon::Put, PYR_JWT);
    ADD_METHOD_TO(ForumController::deletePost, "/api/forum/posts/{id}",
                  drogon::Delete, PYR_JWT);
    ADD_METHOD_TO(ForumController::votePost, "/api/forum/posts/{id}/vote",
                  drogon::Post, PYR_JWT);
    METHOD_LIST_END

    void listCategories(HttpReq req, HttpCbRef callback);
    void createCategory(HttpReq req, HttpCbRef callback);
    void updateCategory(HttpReq req, HttpCbRef callback, int id);
    void deleteCategory(HttpReq req, HttpCbRef callback, int id);
    void getForum(HttpReq req, HttpCbRef callback, int id);
    void createForum(HttpReq req, HttpCbRef callback);
    void updateForum(HttpReq req, HttpCbRef callback, int id);
    void deleteForum(HttpReq req, HttpCbRef callback, int id);
    void getThread(HttpReq req, HttpCbRef callback, int id);
    void createThread(HttpReq req, HttpCbRef callback);
    void updateThread(HttpReq req, HttpCbRef callback, int id);
    void deleteThread(HttpReq req, HttpCbRef callback, int id);
    void setThreadFlags(HttpReq req, HttpCbRef callback, int id);
    void createPost(HttpReq req, HttpCbRef callback);
    void getPostById(HttpReq req, HttpCbRef callback, int id);
    void updatePost(HttpReq req, HttpCbRef callback, int id);
    void deletePost(HttpReq req, HttpCbRef callback, int id);
    void votePost(HttpReq req, HttpCbRef callback, int id);

  private:
    ForumService forumService_;
};

} // namespace pyracms
