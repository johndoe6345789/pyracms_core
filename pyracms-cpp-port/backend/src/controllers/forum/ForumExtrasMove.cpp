#include "controllers/ForumExtrasController.h"
#include "controllers/ForumMoveSql.h"
#include "filters/TenantGuard.h"

#include <drogon/drogon.h>

namespace pyracms {

// Moderators of the thread's site, its owner or a Platform Owner may move a
// thread, only to another forum of that same site (else 404).
void ForumExtrasController::moveThread(HttpReq req, HttpCbRef callback,
                                       int id) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["forumId"].isInt())
        return callback(filterError("forumId is required",
                                    drogon::k400BadRequest));
    int forumId = (*json)["forumId"].asInt();
    int userId = req->attributes()->get<int>("userId");
    drogon::app().getDbClient()->execSqlAsync(
        kMoveThreadSql,
        [callback, id, forumId](const drogon::orm::Result &r) {
            if (r[0]["moved"].as<int>() == 0)
                return callback(filterError("Thread or forum not found",
                                            drogon::k404NotFound));
            Json::Value out;
            out["success"] = true;
            out["id"] = id;
            out["forumId"] = forumId;
            callback(drogon::HttpResponse::newHttpJsonResponse(out));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            callback(filterError("Database error",
                                 drogon::k500InternalServerError));
        },
        id, forumId, userId, tokenTenantOf(req));
}

} // namespace pyracms
