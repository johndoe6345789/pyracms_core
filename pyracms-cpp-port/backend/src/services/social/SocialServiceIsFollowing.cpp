#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::isFollowing(const DbClientPtr &db, int followerId,
                                int followedId, std::function<void(bool)> cb) {
    db->execSqlAsync(
        "SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2",
        [cb](const drogon::orm::Result &result) { cb(!result.empty()); },
        [cb](const drogon::orm::DrogonDbException &) { cb(false); }, followerId,
        followedId);
}

} // namespace pyracms
