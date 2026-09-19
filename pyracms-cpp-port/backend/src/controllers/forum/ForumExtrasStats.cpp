#include "controllers/ForumExtrasController.h"
#include "controllers/ForumStatsSql.h"
#include "controllers/QueryInt.h"
#include "filters/TenantGuard.h"

#include <drogon/drogon.h>

namespace pyracms {

// Public, one site at a time; never exposes an email address.
void ForumExtrasController::userStats(HttpReq req, HttpCbRef callback,
                                      int id) {
    int tenant = queryInt(req->getParameter("tenant_id"), 0);
    if (tenant <= 0)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    drogon::app().getDbClient()->execSqlAsync(
        kUserStatsSql,
        [callback](const drogon::orm::Result &r) {
            if (r.empty())
                return callback(
                    filterError("User not found", drogon::k404NotFound));
            int posts = r[0]["post_count"].as<int>();
            int threads = r[0]["thread_count"].as<int>();
            Json::Value out;
            out["postCount"] = posts;
            out["threadCount"] = threads;
            out["joinedAt"] = r[0]["created_at"].as<std::string>();
            out["reputation"] =
                posts + 2 * threads + 5 * r[0]["like_count"].as<int>();
            callback(drogon::HttpResponse::newHttpJsonResponse(out));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            callback(filterError("Database error",
                                 drogon::k500InternalServerError));
        },
        id, tenant);
}

} // namespace pyracms
