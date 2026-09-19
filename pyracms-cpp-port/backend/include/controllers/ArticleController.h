#pragma once

#include "controllers/HttpAliases.h"
#include "services/ArticleService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class ArticleController : public drogon::HttpController<ArticleController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ArticleController::listArticles, "/api/articles",
                  drogon::Get);
    ADD_METHOD_TO(ArticleController::createArticle, "/api/articles",
                  drogon::Post, PYR_JWT);
    ADD_METHOD_TO(ArticleController::getArticle, "/api/articles/{name}",
                  drogon::Get);
    ADD_METHOD_TO(ArticleController::updateArticle, "/api/articles/{name}",
                  drogon::Put, PYR_JWT, PYR_OWNER);
    ADD_METHOD_TO(ArticleController::deleteArticle, "/api/articles/{name}",
                  drogon::Delete, PYR_JWT, PYR_OWNER);
    ADD_METHOD_TO(ArticleController::listRevisions,
                  "/api/articles/{name}/revisions", drogon::Get);
    ADD_METHOD_TO(ArticleController::getRevision,
                  "/api/articles/{name}/revisions/{revId}", drogon::Get);
    ADD_METHOD_TO(ArticleController::revertToRevision,
                  "/api/articles/{name}/revert/{revId}", drogon::Post, PYR_JWT,
                  PYR_OWNER);
    ADD_METHOD_TO(ArticleController::switchRenderer,
                  "/api/articles/{name}/renderer", drogon::Put, PYR_JWT,
                  PYR_OWNER);
    ADD_METHOD_TO(ArticleController::togglePrivate,
                  "/api/articles/{name}/private", drogon::Put, PYR_JWT,
                  PYR_OWNER);
    ADD_METHOD_TO(ArticleController::voteArticle, "/api/articles/{name}/vote",
                  drogon::Post, PYR_JWT);
    ADD_METHOD_TO(ArticleController::setTags, "/api/articles/{name}/tags",
                  drogon::Put, PYR_JWT, PYR_OWNER);
    ADD_METHOD_TO(ArticleController::publishArticle,
                  "/api/articles/{name}/publish", drogon::Post, PYR_JWT,
                  PYR_OWNER);
    ADD_METHOD_TO(ArticleController::scheduleArticle,
                  "/api/articles/{name}/schedule", drogon::Post, PYR_JWT,
                  PYR_OWNER);
    ADD_METHOD_TO(ArticleController::unpublishArticle,
                  "/api/articles/{name}/unpublish", drogon::Post, PYR_JWT,
                  PYR_OWNER);
    METHOD_LIST_END

    void listArticles(HttpReq req, HttpCbRef callback);
    void createArticle(HttpReq req, HttpCbRef callback);
    void getArticle(HttpReq req, HttpCbRef callback, HttpStr name);
    void updateArticle(HttpReq req, HttpCbRef callback, HttpStr name);
    void deleteArticle(HttpReq req, HttpCbRef callback, HttpStr name);
    void listRevisions(HttpReq req, HttpCbRef callback, HttpStr name);
    void getRevision(HttpReq req, HttpCbRef callback, HttpStr name,
                     HttpStr revId);
    void revertToRevision(HttpReq req, HttpCbRef callback, HttpStr name,
                          HttpStr revId);
    void switchRenderer(HttpReq req, HttpCbRef callback, HttpStr name);
    void togglePrivate(HttpReq req, HttpCbRef callback, HttpStr name);
    void voteArticle(HttpReq req, HttpCbRef callback, HttpStr name);
    void setTags(HttpReq req, HttpCbRef callback, HttpStr name);
    void publishArticle(HttpReq req, HttpCbRef callback, HttpStr name);
    void scheduleArticle(HttpReq req, HttpCbRef callback, HttpStr name);
    void unpublishArticle(HttpReq req, HttpCbRef callback, HttpStr name);

  private:
    ArticleService articleService_;
};

} // namespace pyracms
