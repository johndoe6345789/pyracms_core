#include "controllers/ArticleController.h"

namespace pyracms {

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
            result["authorUsername"] = revision->authorUsername;
            result["createdAt"] = revision->createdAt;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
