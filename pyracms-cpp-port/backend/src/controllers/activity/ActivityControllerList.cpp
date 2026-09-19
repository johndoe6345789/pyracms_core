#include "controllers/ActivityController.h"
#include "controllers/ActivitySql.h"
#include "controllers/QueryInt.h"
#include "filters/TenantGuard.h"

#include <drogon/drogon.h>

namespace pyracms {

// Public: recent visible activity of one site, newest first.
void ActivityController::list(HttpReq req, HttpCbRef callback) {
    int tenant = queryInt(req->getParameter("tenant_id"), 0);
    if (tenant <= 0)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    int limit = clampRange(queryInt(req->getParameter("limit"), 20), 1, 50);
    drogon::app().getDbClient()->execSqlAsync(
        kActivitySql,
        [callback](const drogon::orm::Result &rows) {
            Json::Value out(Json::arrayValue);
            for (const auto &r : rows) {
                Json::Value j;
                j["id"] = r["id"].as<int>();
                for (const char *k : {"type", "actor", "title", "link"})
                    j[k] = r[k].as<std::string>();
                j["createdAt"] = r["created_at"].as<std::string>();
                out.append(j);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(out));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            callback(filterError("Database error",
                                 drogon::k500InternalServerError));
        },
        tenant, limit);
}

} // namespace pyracms
