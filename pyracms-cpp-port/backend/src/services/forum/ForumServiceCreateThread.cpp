#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::createThread(const DbClientPtr &db, int forumId,
                                const std::string &title,
                                const std::string &description,
                                const std::string &content, int userId,
                                int tenantId, IdCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forum_threads (name, description, forum_id, user_id, "
        "view_count, total_posts, created_at) "
        "SELECT $1::text, $2::text, f.id, $4::int, 0, 1, NOW() "
        "FROM forums f WHERE f.id = $3::int AND ($5::int = 0 OR EXISTS "
        "(SELECT 1 FROM forum_categories c WHERE c.id = f.category_id "
        "AND c.tenant_id = $5::int)) RETURNING id",
        [db, title, content, userId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(0, "Forum not found");
                return;
            }
            int threadId = result[0]["id"].as<int>();

            // Create the first post
            db->execSqlAsync(
                "INSERT INTO forum_posts (title, content, thread_id, user_id, "
                "created_at) VALUES ($1, $2, $3, $4, NOW())",
                [db, threadId, cb](const drogon::orm::Result &) {
                    // Update forum thread/post counts
                    db->execSqlAsync(
                        "UPDATE forums SET total_threads = "
                        "COALESCE(total_threads, 0) + 1, "
                        "total_posts = COALESCE(total_posts, 0) + 1 "
                        "WHERE id = (SELECT forum_id FROM forum_threads WHERE "
                        "id = $1)",
                        [threadId, cb](const drogon::orm::Result &) {
                            cb(threadId, "");
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
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(0, e.base().what());
        },
        title, description, forumId, userId, tenantId);
}

} // namespace pyracms
