#include "controllers/ArticleController.h"

namespace pyracms {

void ArticleController::listArticles(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    int limit = 20;
    int offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    if (!limitStr.empty()) limit = std::stoi(limitStr);
    if (!offsetStr.empty()) offset = std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();

    articleService_.listArticles(
        db, tenantId, limit, offset,
        [callback](const std::vector<ArticleDto> &articles) {
            Json::Value result(Json::arrayValue);
            for (const auto &a : articles) {
                Json::Value item;
                item["id"] = a.id;
                item["name"] = a.name;
                item["displayName"] = a.displayName;
                item["isPrivate"] = a.isPrivate;
                item["hideDisplayName"] = a.hideDisplayName;
                item["userId"] = a.userId;
                item["rendererName"] = a.rendererName;
                item["viewCount"] = a.viewCount;
                item["createdAt"] = a.createdAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ArticleController::createArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name") || !(*json).isMember("displayName") ||
        !(*json).isMember("content") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "name, displayName, content, and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto name = (*json)["name"].asString();
    auto displayName = (*json)["displayName"].asString();
    auto content = (*json)["content"].asString();
    auto renderer = (*json).get("renderer", "markdown").asString();
    int tenantId = (*json)["tenant_id"].asInt();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    articleService_.createArticle(
        db, tenantId, name, displayName, content, renderer, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k409Conflict);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Article created";
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

void ArticleController::getArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    articleService_.getArticle(
        db, tenantId, name,
        [this, db, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            // Get the latest revision content
            articleService_.listRevisions(
                db, article->id,
                [article, callback](const std::vector<ArticleRevisionDto> &revisions) {
                    Json::Value result;
                    result["id"] = article->id;
                    result["name"] = article->name;
                    result["displayName"] = article->displayName;
                    result["isPrivate"] = article->isPrivate;
                    result["hideDisplayName"] = article->hideDisplayName;
                    result["userId"] = article->userId;
                    result["rendererName"] = article->rendererName;
                    result["viewCount"] = article->viewCount;
                    result["createdAt"] = article->createdAt;
                    if (!revisions.empty()) {
                        result["content"] = revisions[0].content;
                    } else {
                        result["content"] = "";
                    }
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void ArticleController::updateArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("content") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "content and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto content = (*json)["content"].asString();
    auto summary = (*json).get("summary", "").asString();
    int tenantId = (*json)["tenant_id"].asInt();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    articleService_.updateArticle(
        db, tenantId, name, content, summary, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Article updated";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ArticleController::deleteArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto json = req->getJsonObject();
        if (!json || !(*json).isMember("tenant_id")) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "tenant_id is required";
            resp->setStatusCode(drogon::k400BadRequest);
            callback(resp);
            return;
        }
        int tenantId = (*json)["tenant_id"].asInt();
        auto db = drogon::app().getDbClient();

        articleService_.deleteArticle(
            db, tenantId, name,
            [callback](bool success, const std::string &error) {
                if (!success) {
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                    (*resp->jsonObject())["error"] = error;
                    resp->setStatusCode(drogon::k404NotFound);
                    callback(resp);
                    return;
                }

                Json::Value result;
                result["message"] = "Article deleted";
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
            });
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    articleService_.deleteArticle(
        db, tenantId, name,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Article deleted";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ArticleController::listRevisions(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    // First find the article by name, then list revisions
    articleService_.getArticle(
        db, tenantId, name,
        [this, db, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.listRevisions(
                db, article->id,
                [callback](const std::vector<ArticleRevisionDto> &revisions) {
                    Json::Value result(Json::arrayValue);
                    for (const auto &r : revisions) {
                        Json::Value item;
                        item["id"] = r.id;
                        item["articleId"] = r.articleId;
                        item["content"] = r.content;
                        item["summary"] = r.summary;
                        item["userId"] = r.userId;
                        item["createdAt"] = r.createdAt;
                        result.append(item);
                    }
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void ArticleController::getRevision(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name,
    const std::string &revId) {

    int revisionId = std::stoi(revId);
    auto db = drogon::app().getDbClient();

    articleService_.getRevision(
        db, revisionId,
        [callback](const std::optional<ArticleRevisionDto> &revision) {
            if (!revision) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Revision not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = revision->id;
            result["articleId"] = revision->articleId;
            result["content"] = revision->content;
            result["summary"] = revision->summary;
            result["userId"] = revision->userId;
            result["createdAt"] = revision->createdAt;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ArticleController::revertToRevision(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name,
    const std::string &revId) {

    auto tenantIdStr = req->getParameter("tenant_id");
    auto json = req->getJsonObject();
    int tenantId = 0;
    if (!tenantIdStr.empty()) {
        tenantId = std::stoi(tenantIdStr);
    } else if (json && (*json).isMember("tenant_id")) {
        tenantId = (*json)["tenant_id"].asInt();
    } else {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int revisionId = std::stoi(revId);
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    // Find article by name first
    articleService_.getArticle(
        db, tenantId, name,
        [this, db, revisionId, userId, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.revertToRevision(
                db, article->id, revisionId, userId,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k404NotFound);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["message"] = "Article reverted";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void ArticleController::switchRenderer(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("renderer") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "renderer and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto renderer = (*json)["renderer"].asString();
    int tenantId = (*json)["tenant_id"].asInt();
    auto db = drogon::app().getDbClient();

    // Find article by name first
    articleService_.getArticle(
        db, tenantId, name,
        [this, db, renderer, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.switchRenderer(
                db, article->id, renderer,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["message"] = "Renderer updated";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void ArticleController::togglePrivate(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = (*json)["tenant_id"].asInt();
    auto db = drogon::app().getDbClient();

    articleService_.getArticle(
        db, tenantId, name,
        [this, db, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.togglePrivate(
                db, article->id,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["message"] = "Privacy toggled";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void ArticleController::voteArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("is_like") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "is_like and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    bool isLike = (*json)["is_like"].asBool();
    int tenantId = (*json)["tenant_id"].asInt();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    articleService_.getArticle(
        db, tenantId, name,
        [this, db, userId, isLike, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.voteArticle(
                db, article->id, userId, isLike,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["message"] = "Vote recorded";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void ArticleController::setTags(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tags") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tags and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    std::vector<std::string> tags;
    for (const auto &tag : (*json)["tags"]) {
        tags.push_back(tag.asString());
    }
    int tenantId = (*json)["tenant_id"].asInt();
    auto db = drogon::app().getDbClient();

    articleService_.getArticle(
        db, tenantId, name,
        [this, db, tags, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.setTags(
                db, article->id, tags,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["message"] = "Tags updated";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
