#include "controllers/CodeSnippetController.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "filters/Viewer.h"

namespace pyracms {

void CodeSnippetController::listSnippets(
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
    int authorId = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    auto language = req->getParameter("language");
    auto authorStr = req->getParameter("author_id");
    if (!limitStr.empty())
        limit = std::stoi(limitStr);
    if (!offsetStr.empty())
        offset = std::stoi(offsetStr);
    if (!authorStr.empty())
        authorId = std::stoi(authorStr);

    auto db = drogon::app().getDbClient();

    snippetService_.listSnippets(
        db, tenantId, language, authorId, viewerOf(req).userId, limit, offset,
        [callback](const std::vector<CodeSnippetDto> &snippets, int total) {
            Json::Value result;
            result["total"] = total;
            result["items"] = Json::Value(Json::arrayValue);
            for (const auto &s : snippets) {
                Json::Value item;
                item["id"] = s.id;
                item["tenantId"] = s.tenantId;
                item["authorId"] = s.authorId;
                item["authorUsername"] = s.authorUsername;
                item["title"] = s.title;
                item["code"] = s.code;
                item["language"] = s.language;
                item["visibility"] = s.visibility;
                item["runCount"] = s.runCount;
                item["forkedFrom"] = s.forkedFrom;
                item["createdAt"] = s.createdAt;
                item["updatedAt"] = s.updatedAt;
                result["items"].append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
