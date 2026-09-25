#include "controllers/CodeSnippetController.h"
#include "controllers/SnippetTagsJson.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "filters/Viewer.h"

namespace pyracms {

void CodeSnippetController::getSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int snippetId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    auto viewer = viewerOf(req);
    snippetService_.getSnippet(
        db, snippetId,
        effectiveScope(viewer.tenantId, req->getParameter("tenant_id")),
        viewer.userId,
        [this, db, callback](const std::optional<CodeSnippetDto> &snippet) {
            if (!snippet) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Snippet not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = snippet->id;
            result["tenantId"] = snippet->tenantId;
            result["authorId"] = snippet->authorId;
            result["authorUsername"] = snippet->authorUsername;
            result["title"] = snippet->title;
            result["code"] = snippet->code;
            result["language"] = snippet->language;
            result["visibility"] = snippet->visibility;
            result["runCount"] = snippet->runCount;
            result["forkedFrom"] = snippet->forkedFrom;
            result["createdAt"] = snippet->createdAt;
            result["updatedAt"] = snippet->updatedAt;
            result["tags"] = snippetTagsJson(*snippet);

            snippetService_.listAttachments(
                db, snippet->id,
                [callback,
                 result](const std::vector<SnippetAttachmentDto> &atts) {
                    Json::Value r = result;
                    Json::Value list(Json::arrayValue);
                    for (const auto &a : atts) {
                        Json::Value item;
                        item["id"] = a.id;
                        item["fileUuid"] = a.fileUuid;
                        item["filename"] = a.filename;
                        item["mimetype"] = a.mimetype;
                        item["size"] = static_cast<Json::Int64>(a.size);
                        list.append(item);
                    }
                    r["attachments"] = list;
                    callback(drogon::HttpResponse::newHttpJsonResponse(r));
                });
        });
}

} // namespace pyracms
