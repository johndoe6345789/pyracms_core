#pragma once

#include <drogon/HttpController.h>
#include "services/ArticleService.h"

namespace pyracms {

class ArticleController : public drogon::HttpController<ArticleController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ArticleController::listArticles, "/api/articles", drogon::Get);
    ADD_METHOD_TO(ArticleController::createArticle, "/api/articles", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::getArticle, "/api/articles/{name}", drogon::Get);
    ADD_METHOD_TO(ArticleController::updateArticle, "/api/articles/{name}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::deleteArticle, "/api/articles/{name}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::listRevisions, "/api/articles/{name}/revisions", drogon::Get);
    ADD_METHOD_TO(ArticleController::getRevision, "/api/articles/{name}/revisions/{revId}", drogon::Get);
    ADD_METHOD_TO(ArticleController::revertToRevision, "/api/articles/{name}/revert/{revId}", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::switchRenderer, "/api/articles/{name}/renderer", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::togglePrivate, "/api/articles/{name}/private", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::voteArticle, "/api/articles/{name}/vote", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::setTags, "/api/articles/{name}/tags", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::publishArticle, "/api/articles/{name}/publish", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::scheduleArticle, "/api/articles/{name}/schedule", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(ArticleController::unpublishArticle, "/api/articles/{name}/unpublish", drogon::Post, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void listArticles(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void createArticle(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getArticle(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    const std::string &name);

    void updateArticle(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &name);

    void deleteArticle(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &name);

    void listRevisions(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &name);

    void getRevision(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     const std::string &name,
                     const std::string &revId);

    void revertToRevision(const drogon::HttpRequestPtr &req,
                          std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                          const std::string &name,
                          const std::string &revId);

    void switchRenderer(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        const std::string &name);

    void togglePrivate(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &name);

    void voteArticle(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     const std::string &name);

    void setTags(const drogon::HttpRequestPtr &req,
                 std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                 const std::string &name);

    void publishArticle(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        const std::string &name);

    void scheduleArticle(const drogon::HttpRequestPtr &req,
                         std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                         const std::string &name);

    void unpublishArticle(const drogon::HttpRequestPtr &req,
                          std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                          const std::string &name);

private:
    ArticleService articleService_;
};

} // namespace pyracms
