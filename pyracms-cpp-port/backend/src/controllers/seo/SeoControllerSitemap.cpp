#include "controllers/SeoController.h"
#include "controllers/seo/SeoControllerInternal.h"
#include "security/SsrfGuard.h"

namespace pyracms {

void SeoController::sitemap(
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
    auto baseUrl = safeBaseUrl(req->getParameter("base_url"));

    auto db = drogon::app().getDbClient();

    seoService_.generateSitemap(
        db, tenantId, baseUrl, [callback](const std::string &xml) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setBody(xml);
            resp->setContentTypeCode(drogon::CT_TEXT_XML);
            callback(resp);
        });
}

} // namespace pyracms
