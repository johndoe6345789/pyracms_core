#include "controllers/ArticleAttachmentController.h"
#include "filters/TenantGuard.h"
#include "filters/Viewer.h"

namespace pyracms {

void ArticleAttachmentController::list(HttpReq req, HttpCbRef callback,
                                       HttpStr name) {
    auto tenant = req->getParameter("tenant_id");
    if (tenant.empty() || tenant.size() > 9 ||
        tenant.find_first_not_of("0123456789") != std::string::npos)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    int tenantId = std::stoi(tenant);
    auto db = drogon::app().getDbClient();
    // getArticle applies the same visibility rules as the article itself.
    articleService_.getArticle(
        db, tenantId, name, viewerIdFor(req, tenantId),
        [this, db, callback](const std::optional<ArticleDto> &article) {
            if (!article)
                return callback(
                    filterError("Article not found", drogon::k404NotFound));
            attachments_.list(
                db, article->id,
                [callback](const std::vector<ArticleAttachmentDto> &all) {
                    Json::Value out(Json::arrayValue);
                    for (const auto &a : all) {
                        Json::Value item;
                        item["id"] = a.id;
                        item["fileUuid"] = a.fileUuid;
                        item["filename"] = a.filename;
                        item["mimetype"] = a.mimetype;
                        item["size"] = static_cast<Json::Int64>(a.size);
                        out.append(item);
                    }
                    callback(drogon::HttpResponse::newHttpJsonResponse(out));
                });
        });
}

} // namespace pyracms
