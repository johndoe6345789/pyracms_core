#include "controllers/AnalyticsController.h"
#include "controllers/analytics/AnalyticsControllerInternal.h"
#include "filters/UserVisibility.h"

#include <functional>
#include <iomanip>
#include <openssl/sha.h>
#include <sstream>

namespace pyracms {

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
    limit = clampLimit(limitStr, limit, 100);

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

} // namespace pyracms
