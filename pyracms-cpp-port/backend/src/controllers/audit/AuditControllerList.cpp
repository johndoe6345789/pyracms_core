#include "controllers/AuditController.h"
#include "filters/TenantGuard.h"
#include "controllers/QueryInt.h"

#include <drogon/drogon.h>

namespace pyracms {

// Admins/owners of the named site only (AdminFilter); a site-bound token
// is already confined to its own site by JwtAuthFilter.
void AuditController::list(HttpReq req, HttpCbRef callback) {
    int tenant = queryInt(req->getParameter("tenant_id"), 0);
    if (tenant <= 0)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    int limit = clampRange(queryInt(req->getParameter("limit"), 50), 1, 200);
    drogon::app().getDbClient()->execSqlAsync(
        "SELECT a.id, a.action, a.target, a.created_at, "
        "COALESCE(a.actor_id, 0) AS actor_id, "
        "COALESCE(u.username, '') AS actor FROM audit_log a "
        "LEFT JOIN users u ON u.id = a.actor_id WHERE a.tenant_id = $1 "
        "ORDER BY a.created_at DESC, a.id DESC LIMIT $2::int",
        [callback](const drogon::orm::Result &rows) {
            Json::Value out(Json::arrayValue);
            for (const auto &r : rows) {
                Json::Value j;
                j["id"] = r["id"].as<int>();
                j["action"] = r["action"].as<std::string>();
                j["target"] = r["target"].as<std::string>();
                j["actor"] = r["actor"].as<std::string>();
                j["actorId"] = r["actor_id"].as<int>();
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
