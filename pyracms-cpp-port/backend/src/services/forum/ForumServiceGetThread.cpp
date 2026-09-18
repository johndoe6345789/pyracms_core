#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

// --- Threads ---
void ForumService::getThread(
    const DbClientPtr &db, int threadId, int tenantId,
    std::function<void(const std::optional<ForumThreadWithPostsDto> &)> cb) {

    // Fetch thread (scoped to the tenant when tenantId != 0)
    db->execSqlAsync(
        std::string("SELECT ") + kThreadCols + kThreadFrom +
            "WHERE t.id = $1 AND ($2::int = 0 OR EXISTS "
            "(SELECT 1 FROM forums tf JOIN forum_categories tc "
            "ON tc.id = tf.category_id WHERE tf.id = t.forum_id "
            "AND tc.tenant_id = $2::int))",
        [this, db, threadId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
                return;
            }

            // Increment view count only for a visible thread
            db->execSqlAsync(
                "UPDATE forum_threads "
                "SET view_count = COALESCE(view_count, 0) + 1 "
                "WHERE id = $1",
                [](const drogon::orm::Result &) {},
                [](const drogon::orm::DrogonDbException &) {}, threadId);

            ForumThreadWithPostsDto dto;
            dto.thread = rowToThreadDto(result[0]);

            db->execSqlAsync(
                "SELECT p.id, p.title, p.content, p.created_at, "
                "p.user_id, u.username, p.thread_id, "
                "(SELECT COUNT(*) FROM forum_post_votes v "
                "WHERE v.post_id = p.id AND v.is_like)::int AS likes, "
                "(SELECT COUNT(*) FROM forum_post_votes v "
                "WHERE v.post_id = p.id AND NOT v.is_like)::int AS dislikes "
                "FROM forum_posts p "
                "LEFT JOIN users u ON u.id = p.user_id "
                "WHERE p.thread_id = $1 "
                "ORDER BY p.created_at ASC, p.id ASC",
                [this, dto, cb](const drogon::orm::Result &postResult) mutable {
                    for (const auto &row : postResult) {
                        auto post = rowToPostDto(row);
                        post.likes = row["likes"].as<int>();
                        post.dislikes = row["dislikes"].as<int>();
                        dto.posts.push_back(post);
                    }
                    cb(dto);
                },
                [cb](const drogon::orm::DrogonDbException &) {
                    cb(std::nullopt);
                },
                threadId);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        threadId, tenantId);
}

} // namespace pyracms
