#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::unfollowUser(const DbClientPtr &db, int followerId,
                                 int followedId, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Not following this user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        followerId, followedId);
}

} // namespace pyracms
