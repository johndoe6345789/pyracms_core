#include "controllers/AnalyticsController.h"
#include "controllers/QueryInt.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// Admin dashboard numbers for one site (AdminFilter: site admin/owner).
void AnalyticsController::getSummary(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    int tenant = queryInt(req->getParameter("tenant_id"), 0);
    if (tenant <= 0)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    analyticsService_.getSummary(
        drogon::app().getDbClient(), tenant,
        [callback](bool ok, const AnalyticsSummary &s) {
            if (!ok)
                return callback(filterError("Database error",
                                            drogon::k500InternalServerError));
            Json::Value out;
            out["views7d"] = s.views7;
            out["views30d"] = s.views30;
            out["topPages"] = Json::Value(Json::arrayValue);
            for (const auto &p : s.topPages) {
                Json::Value j;
                j["path"] = p.path;
                j["views"] = p.views;
                out["topPages"].append(j);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(out));
        });
}

} // namespace pyracms
