#include "controllers/AnalyticsController.h"

#include <functional>
#include <openssl/sha.h>
#include <sstream>
#include <iomanip>

namespace pyracms {

static std::string sha256Hash(const std::string &input) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char *>(input.c_str()), input.size(), hash);
    std::ostringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(hash[i]);
    }
    return ss.str();
}

void AnalyticsController::getPageViews(
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
    auto period = req->getParameter("period");
    if (period.empty()) period = "day";

    auto db = drogon::app().getDbClient();

    analyticsService_.getPageViews(
        db, tenantId, period,
        [callback](const std::vector<PageViewStat> &stats) {
            Json::Value result(Json::arrayValue);
            for (const auto &s : stats) {
                Json::Value item;
                item["date"] = s.date;
                item["count"] = s.count;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void AnalyticsController::getTopContent(
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
    auto limitStr = req->getParameter("limit");
    if (!limitStr.empty()) limit = std::stoi(limitStr);

    auto db = drogon::app().getDbClient();

    analyticsService_.getTopContent(
        db, tenantId, limit,
        [callback](const std::vector<TopContentItem> &items) {
            Json::Value result(Json::arrayValue);
            for (const auto &item : items) {
                Json::Value jsonItem;
                jsonItem["path"] = item.path;
                jsonItem["title"] = item.title;
                jsonItem["views"] = item.views;
                result.append(jsonItem);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void AnalyticsController::getTrafficSources(
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
    auto limitStr = req->getParameter("limit");
    if (!limitStr.empty()) limit = std::stoi(limitStr);

    auto db = drogon::app().getDbClient();

    analyticsService_.getTrafficSources(
        db, tenantId, limit,
        [callback](const std::vector<TrafficSource> &sources) {
            Json::Value result(Json::arrayValue);
            for (const auto &s : sources) {
                Json::Value item;
                item["referrer"] = s.referrer;
                item["count"] = s.count;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void AnalyticsController::getSearchQueries(
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
    auto limitStr = req->getParameter("limit");
    if (!limitStr.empty()) limit = std::stoi(limitStr);

    auto db = drogon::app().getDbClient();

    analyticsService_.getSearchQueries(
        db, tenantId, limit,
        [callback](const std::vector<SearchQueryStat> &stats) {
            Json::Value result(Json::arrayValue);
            for (const auto &s : stats) {
                Json::Value item;
                item["query"] = s.query;
                item["count"] = s.count;
                item["avgResults"] = s.avgResults;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void AnalyticsController::trackPageView(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("path") || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "path and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto path = (*json)["path"].asString();
    auto referrer = (*json).get("referrer", "").asString();
    int tenantId = (*json)["tenant_id"].asInt();

    // Get user agent from request headers
    auto userAgent = req->getHeader("User-Agent");

    // Hash the IP for privacy
    auto peerAddr = req->getPeerAddr();
    std::string ipHash = sha256Hash(peerAddr.toIp());

    auto db = drogon::app().getDbClient();

    analyticsService_.trackPageView(
        db, tenantId, path, referrer, userAgent, ipHash,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Page view tracked";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
