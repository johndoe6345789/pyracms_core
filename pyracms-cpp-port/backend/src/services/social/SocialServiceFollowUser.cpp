#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::followUser(const DbClientPtr &db, int followerId,
                               int followedId, BoolCallback cb) {
    if (followerId == followedId) {
        cb(false, "Cannot follow yourself");
        return;
    }

    db->execSqlAsync(
        // Accounts can only follow accounts of their own site (or, for
        // platform accounts, other platform accounts).
        "WITH ok AS (SELECT 1 FROM users a JOIN users b ON "
        "COALESCE(a.tenant_id, 0) = COALESCE(b.tenant_id, 0) "
        "WHERE a.id = $1::int AND b.id = $2::int), "
        "ins AS (INSERT INTO follows (follower_id, followed_id) "
        "SELECT $1::int, $2::int FROM ok ON CONFLICT DO NOTHING) "
        "SELECT COUNT(*)::int AS found FROM ok",
        [cb](const drogon::orm::Result &result) {
            if (result[0]["found"].as<int>() == 0)
                cb(false, "User not found");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        followerId, followedId);
}

} // namespace pyracms
