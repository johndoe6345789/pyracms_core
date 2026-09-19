#include "controllers/ArticleController.h"
#include "filters/Viewer.h"

namespace pyracms {

static void notFound(
    const std::function<void(const drogon::HttpResponsePtr &)> &callback) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = "Revision not found";
    resp->setStatusCode(drogon::k404NotFound);
    callback(resp);
}

// A revision is only served through an article the viewer may see.
void ArticleController::getRevision(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name,
    const std::string &revId) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }
    int tenantId = std::stoi(tenantIdStr);
    int revisionId = std::stoi(revId);
    auto db = drogon::app().getDbClient();

    articleService_.getArticle(
        db, tenantId, name, viewerIdFor(req, tenantId),
        [this, db, revisionId,
         callback](const std::optional<ArticleDto> &article) {
            if (!article)
                return notFound(callback);
            articleService_.getRevision(
                db, article->id, revisionId,
                [callback](const std::optional<ArticleRevisionDto> &rev) {
                    if (!rev)
                        return notFound(callback);
                    Json::Value result;
                    result["id"] = rev->id;
                    result["articleId"] = rev->articleId;
                    result["content"] = rev->content;
                    result["summary"] = rev->summary;
                    result["userId"] = rev->userId;
                    result["authorUsername"] = rev->authorUsername;
                    result["createdAt"] = rev->createdAt;
                    callback(
                        drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
