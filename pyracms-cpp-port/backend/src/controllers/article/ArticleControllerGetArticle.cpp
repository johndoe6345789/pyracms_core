#include "controllers/ArticleController.h"

namespace pyracms {

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

            // Fetch username, revisions, and tags in parallel via sequential chaining
            db->execSqlAsync(
                "SELECT username FROM users WHERE id = $1",
                [this, db, article, callback](const drogon::orm::Result &userResult) {
                    std::string username = "Unknown";
                    if (userResult.size() > 0) {
                        username = userResult[0]["username"].as<std::string>();
                    }

                    articleService_.listRevisions(
                        db, article->id,
                        [this, db, article, username, callback](const std::vector<ArticleRevisionDto> &revisions) {
                            articleService_.listTags(
                                db, article->id,
                                [article, username, revisions, callback](const std::vector<std::string> &tags) {
                                    Json::Value result;
                                    result["id"] = article->id;
                                    result["name"] = article->name;
                                    result["displayName"] = article->displayName;
                                    result["isPrivate"] = article->isPrivate;
                                    result["hideDisplayName"] = article->hideDisplayName;
                                    result["userId"] = article->userId;
                                    result["authorUsername"] = username;
                                    result["rendererName"] = article->rendererName;
                                    result["viewCount"] = article->viewCount;
                                    result["createdAt"] = article->createdAt;
                                    result["status"] = article->status;
                                    result["publishedAt"] = article->publishedAt;
                                    result["scheduledAt"] = article->scheduledAt;
                                    result["revisionCount"] = static_cast<int>(revisions.size());
                                    result["content"] = revisions.empty() ? "" : revisions[0].content;
                                    Json::Value tagsArray(Json::arrayValue);
                                    for (const auto &tag : tags) {
                                        tagsArray.append(tag);
                                    }
                                    result["tags"] = tagsArray;
                                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                                });
                        });
                },
                [this, db, article, callback](const drogon::orm::DrogonDbException &) {
                    // fallback: no username
                    articleService_.listRevisions(
                        db, article->id,
                        [this, db, article, callback](const std::vector<ArticleRevisionDto> &revisions) {
                            articleService_.listTags(
                                db, article->id,
                                [article, revisions, callback](const std::vector<std::string> &tags) {
                                    Json::Value result;
                                    result["id"] = article->id;
                                    result["name"] = article->name;
                                    result["displayName"] = article->displayName;
                                    result["isPrivate"] = article->isPrivate;
                                    result["hideDisplayName"] = article->hideDisplayName;
                                    result["userId"] = article->userId;
                                    result["authorUsername"] = "Unknown";
                                    result["rendererName"] = article->rendererName;
                                    result["viewCount"] = article->viewCount;
                                    result["createdAt"] = article->createdAt;
                                    result["status"] = article->status;
                                    result["revisionCount"] = static_cast<int>(revisions.size());
                                    result["content"] = revisions.empty() ? "" : revisions[0].content;
                                    Json::Value tagsArray(Json::arrayValue);
                                    for (const auto &tag : tags) {
                                        tagsArray.append(tag);
                                    }
                                    result["tags"] = tagsArray;
                                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                                });
                        });
                },
                article->userId);
        });
}

} // namespace pyracms
