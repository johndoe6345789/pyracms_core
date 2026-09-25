#include "controllers/CodeSnippetController.h"
#include "filters/TenantRules.h"
#include "filters/UserVisibility.h"
#include "filters/Viewer.h"

namespace pyracms {

static Json::Value revisionJson(const SnippetRevisionDto &r) {
    Json::Value item;
    item["id"] = r.id;
    item["revisionNumber"] = r.number;
    item["snippetId"] = r.snippetId;
    item["title"] = r.title;
    item["code"] = r.code;
    item["language"] = r.language;
    item["summary"] = r.summary;
    item["userId"] = r.userId;
    item["authorUsername"] = r.authorUsername;
    item["createdAt"] = r.createdAt;
    return item;
}

static drogon::HttpResponsePtr notFound(const char *what) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = what;
    resp->setStatusCode(drogon::k404NotFound);
    return resp;
}

// History is exactly as visible as the snippet itself (getSnippet's rules).
void CodeSnippetController::listRevisions(HttpReq req, HttpCbRef callback,
                                          HttpStr id) {
    int snippetId = std::stoi(id);
    int limit = clampLimit(req->getParameter("limit"), 100, 200);
    auto db = drogon::app().getDbClient();
    auto viewer = viewerOf(req);
    snippetService_.getSnippet(
        db, snippetId,
        effectiveScope(viewer.tenantId, req->getParameter("tenant_id")),
        viewer.userId,
        [this, db, limit,
         callback](const std::optional<CodeSnippetDto> &snippet) {
            if (!snippet)
                return callback(notFound("Snippet not found"));
            snippetService_.listRevisions(
                db, snippet->id, limit,
                [callback](const std::vector<SnippetRevisionDto> &revs) {
                    Json::Value out(Json::arrayValue);
                    for (const auto &r : revs)
                        out.append(revisionJson(r));
                    callback(drogon::HttpResponse::newHttpJsonResponse(out));
                });
        });
}

void CodeSnippetController::getRevision(HttpReq req, HttpCbRef callback,
                                        HttpStr id, HttpStr number) {
    int snippetId = std::stoi(id);
    int n = std::stoi(number);
    auto db = drogon::app().getDbClient();
    auto viewer = viewerOf(req);
    snippetService_.getSnippet(
        db, snippetId,
        effectiveScope(viewer.tenantId, req->getParameter("tenant_id")),
        viewer.userId,
        [this, db, n, callback](const std::optional<CodeSnippetDto> &s) {
            if (!s)
                return callback(notFound("Snippet not found"));
            snippetService_.getRevision(
                db, s->id, n,
                [callback](const std::optional<SnippetRevisionDto> &r) {
                    if (!r)
                        return callback(notFound("Revision not found"));
                    callback(drogon::HttpResponse::newHttpJsonResponse(
                        revisionJson(*r)));
                });
        });
}

} // namespace pyracms
