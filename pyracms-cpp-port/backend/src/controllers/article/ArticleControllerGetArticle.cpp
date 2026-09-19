#include "controllers/ArticleController.h"
#include "controllers/article/ArticleControllerJson.h"
#include "filters/TenantGuard.h"
#include "filters/Viewer.h"

namespace pyracms {

void ArticleController::getArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        callback(filterError("tenant_id is required", drogon::k400BadRequest));
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    articleService_.getArticle(
        db, tenantId, name, viewerIdFor(req, tenantId),
        [this, db, callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                callback(
                    filterError("Article not found", drogon::k404NotFound));
                return;
            }
            // Author name, then revisions, then tags, chained.
            auto respond = [this, db, article,
                            callback](const std::string &username, bool full) {
                articleService_.listRevisions(
                    db, article->id,
                    [this, db, article, username, full,
                     callback](const std::vector<ArticleRevisionDto> &revs) {
                        articleService_.listTags(
                            db, article->id,
                            [article, username, full, revs,
                             callback](const std::vector<std::string> &tags) {
                                callback(
                                    drogon::HttpResponse::newHttpJsonResponse(
                                        articleJson(*article, username, revs,
                                                    tags, full)));
                            });
                    });
            };
            db->execSqlAsync(
                "SELECT username FROM users WHERE id = $1",
                [respond](const drogon::orm::Result &userResult) {
                    std::string username = "Unknown";
                    if (userResult.size() > 0) {
                        username = userResult[0]["username"].as<std::string>();
                    }
                    respond(username, true);
                },
                [respond](const drogon::orm::DrogonDbException &) {
                    respond("Unknown", false); // fallback: no username
                },
                article->userId);
        });
}

} // namespace pyracms
