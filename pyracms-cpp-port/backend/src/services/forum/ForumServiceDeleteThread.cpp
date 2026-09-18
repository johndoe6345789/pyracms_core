#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::deleteThread(const DbClientPtr &db, int id, int userId,
                                BoolCallback cb) {
    // Permission check first
    db->execSqlAsync(
        std::string("SELECT id FROM forum_threads WHERE id = $2 AND ") +
            kOwnerOrMod,
        [db, id, cb](const drogon::orm::Result &check) {
            if (check.empty()) {
                cb(false, "Thread not found or not permitted");
                return;
            }
            // Update forum counts before deleting
            db->execSqlAsync(
                "UPDATE forums SET "
                "total_threads = GREATEST(COALESCE(total_threads, 0) - 1, 0), "
                "total_posts = GREATEST(COALESCE(total_posts, 0) - "
                "(SELECT COUNT(*) FROM forum_posts WHERE thread_id = $1), 0) "
                "WHERE id = (SELECT forum_id FROM forum_threads WHERE id = $1)",
                [db, id, cb](const drogon::orm::Result &) {
                    // Delete posts first, then thread
                    db->execSqlAsync(
                        "DELETE FROM forum_posts WHERE thread_id = $1",
                        [db, id, cb](const drogon::orm::Result &) {
                            db->execSqlAsync(
                                "DELETE FROM forum_threads WHERE id = $1",
                                [cb](const drogon::orm::Result &) {
                                    cb(true, "");
                                },
                                [cb](const drogon::orm::DrogonDbException &e) {
                                    cb(false, e.base().what());
                                },
                                id);
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(false, e.base().what());
                        },
                        id);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                id);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, id);
}

} // namespace pyracms
