#include "controllers/ArticleController.h"
#include "filters/TenantGuard.h"

#include <regex>

namespace pyracms {

// 2026-09-19T12:30[:00[.123]][Z|+01:00] (a space may replace the T).
static const std::regex kIsoTime(
    R"(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?)"
    R"((Z|[+-]\d{2}(:?\d{2})?)?)");

void ArticleController::scheduleArticle(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tenant_id") ||
        !(*json).isMember("scheduled_at")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id and scheduled_at required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = (*json)["tenant_id"].asInt();
    auto scheduledAt = (*json)["scheduled_at"].asString();
    if (!(*json)["scheduled_at"].isString() ||
        !std::regex_match(scheduledAt, kIsoTime)) {
        callback(filterError("scheduled_at must be an ISO 8601 time",
                             drogon::k400BadRequest));
        return;
    }
    auto db = drogon::app().getDbClient();

    articleService_.findArticle(
        db, tenantId, name,
        [this, db, scheduledAt,
         callback](const std::optional<ArticleDto> &article) {
            if (!article) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            articleService_.scheduleArticle(
                db, article->id, scheduledAt,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(
                            Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }
                    Json::Value result;
                    result["message"] = "Article scheduled";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
