#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

// --- Posts ---
void ForumService::createPost(const DbClientPtr &db, int threadId,
                              const std::string &title,
                              const std::string &content, int userId,
                              IdCallback cb) {
    // Refuses locked or missing threads (no row inserted).
    db->execSqlAsync(
        "INSERT INTO forum_posts (title, content, thread_id, user_id, "
        "created_at) SELECT $1::text, $2::text, t.id, $4::int, NOW() "
        "FROM forum_threads t WHERE t.id = $3::int AND NOT t.is_locked "
        "RETURNING id",
        [db, threadId, cb](const drogon::orm::Result &inserted) {
            if (inserted.empty()) {
                cb(0, "Thread is locked or not found");
                return;
            }
            int postId = inserted[0]["id"].as<int>();
            // Update thread post count
            db->execSqlAsync(
                "UPDATE forum_threads SET total_posts = COALESCE(total_posts, "
                "0) + 1 "
                "WHERE id = $1",
                [db, threadId, postId, cb](const drogon::orm::Result &) {
                    // Update forum post count
                    db->execSqlAsync(
                        "UPDATE forums SET total_posts = COALESCE(total_posts, "
                        "0) + 1 "
                        "WHERE id = (SELECT forum_id FROM forum_threads WHERE "
                        "id = $1)",
                        [postId, cb](const drogon::orm::Result &) {
                            cb(postId, "");
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(0, e.base().what());
                        },
                        threadId);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(0, e.base().what());
                },
                threadId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(0, e.base().what());
        },
        title, content, threadId, userId);
}

} // namespace pyracms
