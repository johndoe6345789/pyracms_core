#include "services/ForumService.h"
#include "services/DbError.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::deletePost(const DbClientPtr &db, int postId, int userId,
                              BoolCallback cb) {
    // Get thread_id before deleting (also checks permission)
    db->execSqlAsync(
        std::string("SELECT thread_id FROM forum_posts WHERE id = $2 AND ") +
            kPostOwnerOrMod,
        [db, postId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, "Post not found or not permitted");
                return;
            }
            int threadId = result[0]["thread_id"].as<int>();

            db->execSqlAsync(
                "DELETE FROM forum_posts WHERE id = $1",
                [db, threadId, cb](const drogon::orm::Result &) {
                    // Update thread post count
                    db->execSqlAsync(
                        "UPDATE forum_threads SET "
                        "total_posts = GREATEST(COALESCE(total_posts, 0) - 1, "
                        "0) "
                        "WHERE id = $1",
                        [db, threadId, cb](const drogon::orm::Result &) {
                            // Update forum post count
                            db->execSqlAsync(
                                "UPDATE forums SET "
                                "total_posts = GREATEST(COALESCE(total_posts, "
                                "0) - 1, 0) "
                                "WHERE id = (SELECT forum_id FROM "
                                "forum_threads WHERE id = $1)",
                                [cb](const drogon::orm::Result &) {
                                    cb(true, "");
                                },
                                [cb](const drogon::orm::DrogonDbException &e) {
                                    cb(false, dbError(e));
                                },
                                threadId);
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(false, dbError(e));
                        },
                        threadId);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, dbError(e));
                },
                postId);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(false, "Post not found");
        },
        userId, postId);
}

} // namespace pyracms
