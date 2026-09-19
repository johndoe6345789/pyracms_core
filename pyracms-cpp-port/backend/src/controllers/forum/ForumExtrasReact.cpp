#include "controllers/ForumExtrasController.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "services/ForumReactions.h"

#include <drogon/drogon.h>

namespace pyracms {

// Site gate shared by PUT and DELETE: the post must exist on the caller's
// own site (a platform account may react anywhere); else 404.
static void reactOn(HttpReq req, HttpCb callback, int postId,
                    const std::string &emoji, bool toggle) {
    if (!isAllowedEmoji(emoji))
        return callback(filterError("Unknown emoji", drogon::k400BadRequest));
    auto db = drogon::app().getDbClient();
    int userId = req->attributes()->get<int>("userId");
    int token = tokenTenantOf(req);
    tenantOfPost(db, postId, [=](bool ok, int tenant) {
        if (!ok)
            return callback(
                filterError("Database error", drogon::k500InternalServerError));
        if (tenant == 0 || !tenantMatches(token, tenant))
            return callback(
                filterError("Post not found", drogon::k404NotFound));
        setReaction(db, postId, userId, emoji, toggle, [=](bool done) {
            if (!done)
                return callback(filterError("Database error",
                                            drogon::k500InternalServerError));
            loadPostReactions(db, postId, userId, [=](Json::Value r) {
                Json::Value out;
                out["success"] = true;
                out["reactions"] = r;
                callback(drogon::HttpResponse::newHttpJsonResponse(out));
            });
        });
    });
}

void ForumExtrasController::react(HttpReq req, HttpCbRef callback, int id) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["emoji"].isString())
        return callback(filterError("emoji is required",
                                    drogon::k400BadRequest));
    reactOn(req, callback, id, (*json)["emoji"].asString(), true);
}

void ForumExtrasController::unreact(HttpReq req, HttpCbRef callback, int id,
                                    HttpStr emoji) {
    reactOn(req, callback, id, emoji, false);
}

} // namespace pyracms
