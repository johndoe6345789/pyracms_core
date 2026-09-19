#include "controllers/SeoController.h"
#include "security/SsrfGuard.h"

namespace pyracms {

// base_url is echoed into feeds and JSON-LD: it must be a plain http(s)
// URL with no query, fragment, quotes or angle brackets.
static std::string safeBaseUrl(const std::string &raw) {
    static const std::string fallback = "http://localhost:3000";
    if (raw.empty() || !parseHttpUrl(raw).ok ||
        raw.find_first_of("\"'<>&?#") != std::string::npos)
        return fallback;
    return raw;
}

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
        db, tenantId, baseUrl,
        [callback](const std::string &xml) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setBody(xml);
            resp->setContentTypeCode(drogon::CT_TEXT_XML);
            callback(resp);
        });
}

void SeoController::rssFeed(
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
    auto siteTitle = req->getParameter("title");
    if (siteTitle.empty()) siteTitle = "PyraCMS";

    auto db = drogon::app().getDbClient();

    seoService_.generateRssFeed(
        db, tenantId, baseUrl, siteTitle,
        [callback](const std::string &xml) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setBody(xml);
            resp->setContentTypeCode(drogon::CT_TEXT_XML);
            callback(resp);
        });
}

void SeoController::atomFeed(
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
    auto siteTitle = req->getParameter("title");
    if (siteTitle.empty()) siteTitle = "PyraCMS";

    auto db = drogon::app().getDbClient();

    seoService_.generateAtomFeed(
        db, tenantId, baseUrl, siteTitle,
        [callback](const std::string &xml) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setBody(xml);
            resp->setContentTypeCode(drogon::CT_TEXT_XML);
            callback(resp);
        });
}

void SeoController::articleJsonLd(
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

    seoService_.getArticleJsonLd(
        db, tenantId, name, baseUrl,
        [callback](const Json::Value &ld) {
            if (ld.isNull()) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(ld));
        });
}

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
        db, tenantId, name, baseUrl,
        [callback](const Json::Value &og) {
            if (og.isNull()) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Article not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(og));
        });
}

} // namespace pyracms
