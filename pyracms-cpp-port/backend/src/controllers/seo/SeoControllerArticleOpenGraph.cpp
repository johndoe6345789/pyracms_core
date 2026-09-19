#include "controllers/SeoController.h"
#include "controllers/seo/SeoControllerInternal.h"
#include "security/SsrfGuard.h"

namespace pyracms {

void SeoController::articleOpenGraph(
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
    auto baseUrl = safeBaseUrl(req->getParameter("base_url"));

    auto db = drogon::app().getDbClient();

    seoService_.getOpenGraphData(
        db, tenantId, name, baseUrl, [callback](const Json::Value &og) {
            if (og.isNull()) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(og));
        });
}

} // namespace pyracms
