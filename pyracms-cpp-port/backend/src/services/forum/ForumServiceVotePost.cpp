#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

// --- Voting ---
void ForumService::votePost(const DbClientPtr &db, int postId, int userId,
                            bool isLike, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forum_post_votes (post_id, user_id, is_like) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (post_id, user_id) DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        postId, userId, isLike);
}

} // namespace pyracms
