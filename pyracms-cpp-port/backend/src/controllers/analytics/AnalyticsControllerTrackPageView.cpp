#include "controllers/AnalyticsController.h"
#include "controllers/analytics/AnalyticsControllerInternal.h"
#include "filters/UserVisibility.h"

#include <functional>
#include <iomanip>
#include <openssl/sha.h>
#include <sstream>

namespace pyracms {

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

    if (!(*json)["path"].isString() || !(*json)["tenant_id"].isInt() ||
        !(*json).get("referrer", "").isString()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "path and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }
    // Anonymous endpoint: cap every stored string to its column size
    auto cap = [](std::string s) {
        return s.size() > 500 ? s.substr(0, 500) : s;
    };
    auto path = cap((*json)["path"].asString());
    auto referrer = cap((*json).get("referrer", "").asString());
    int tenantId = (*json)["tenant_id"].asInt();

    // Get user agent from request headers
    auto userAgent = cap(std::string(req->getHeader("User-Agent")));

    // Hash the IP for privacy
    auto peerAddr = req->getPeerAddr();
    std::string ipHash = sha256Hash(peerAddr.toIp());

    auto db = drogon::app().getDbClient();

    analyticsService_.trackPageView(
        db, tenantId, path, referrer, userAgent, ipHash,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Page view tracked";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
