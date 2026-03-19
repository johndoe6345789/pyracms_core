#pragma once

#include <drogon/HttpController.h>
#include "services/ForumService.h"

namespace pyracms {

class ForumController : public drogon::HttpController<ForumController> {
public:
    METHOD_LIST_BEGIN
    // Categories
    ADD_METHOD_TO(ForumController::listCategories, "/api/forum/categories", drogon::Get);
    ADD_METHOD_TO(ForumController::createCategory, "/api/forum/categories", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::updateCategory, "/api/forum/categories/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::deleteCategory, "/api/forum/categories/{id}", drogon::Delete, "pyracms::JwtAuthFilter");

    // Forums
    ADD_METHOD_TO(ForumController::getForum, "/api/forum/forums/{id}", drogon::Get);
    ADD_METHOD_TO(ForumController::createForum, "/api/forum/forums", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::updateForum, "/api/forum/forums/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::deleteForum, "/api/forum/forums/{id}", drogon::Delete, "pyracms::JwtAuthFilter");

    // Threads
    ADD_METHOD_TO(ForumController::getThread, "/api/forum/threads/{id}", drogon::Get);
    ADD_METHOD_TO(ForumController::createThread, "/api/forum/threads", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::updateThread, "/api/forum/threads/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::deleteThread, "/api/forum/threads/{id}", drogon::Delete, "pyracms::JwtAuthFilter");

    // Posts
    ADD_METHOD_TO(ForumController::createPost, "/api/forum/posts", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::getPostById, "/api/forum/posts/{id}", drogon::Get);
    ADD_METHOD_TO(ForumController::updatePost, "/api/forum/posts/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::deletePost, "/api/forum/posts/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ForumController::votePost, "/api/forum/posts/{id}/vote", drogon::Post, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    // Categories
    void listCategories(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void createCategory(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void updateCategory(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        int id);

    void deleteCategory(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        int id);

    // Forums
    void getForum(const drogon::HttpRequestPtr &req,
                  std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                  int id);

    void createForum(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void updateForum(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     int id);

    void deleteForum(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     int id);

    // Threads
    void getThread(const drogon::HttpRequestPtr &req,
                   std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                   int id);

    void createThread(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void updateThread(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                      int id);

    void deleteThread(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                      int id);

    // Posts
    void createPost(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getPostById(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     int id);

    void updatePost(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    int id);

    void deletePost(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    int id);

    void votePost(const drogon::HttpRequestPtr &req,
                  std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                  int id);

private:
    ForumService forumService_;
};

} // namespace pyracms
