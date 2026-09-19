#include "services/ForumService.h"
#include "services/DbError.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::updatePost(const DbClientPtr &db, int postId, int userId,
                              const std::string &title,
                              const std::string &content, BoolCallback cb) {
    db->execSqlAsync(
        std::string("UPDATE forum_posts SET title = $2, content = $3 "
                    "WHERE id = $4 AND ") +
            kPostOwnerOrMod,
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Post not found or not permitted");
                return;
            }
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        userId, title, content, postId);
}

} // namespace pyracms
