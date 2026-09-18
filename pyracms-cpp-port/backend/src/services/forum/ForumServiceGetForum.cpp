#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

// --- Forums ---
void ForumService::getForum(
    const DbClientPtr &db, int forumId, int tenantId,
    std::function<void(const std::optional<ForumWithThreadsDto> &)> cb) {

    // Scoped to the tenant when tenantId != 0
    db->execSqlAsync(
        "SELECT f.id, f.name, f.description, f.category_id, "
        "COALESCE(f.total_threads, 0) AS total_threads, "
        "COALESCE(f.total_posts, 0) AS total_posts "
        "FROM forums f WHERE f.id = $1 AND ($2::int = 0 OR EXISTS "
        "(SELECT 1 FROM forum_categories c WHERE c.id = f.category_id "
        "AND c.tenant_id = $2::int))",
        [this, db, forumId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
                return;
            }

            ForumWithThreadsDto dto;
            dto.forum = rowToForumDto(result[0]);

            db->execSqlAsync(
                std::string("SELECT ") + kThreadCols + kThreadFrom +
                    "WHERE t.forum_id = $1 "
                    "ORDER BY t.is_pinned DESC, last_post_at DESC",
                [this, dto,
                 cb](const drogon::orm::Result &threadResult) mutable {
                    for (const auto &row : threadResult) {
                        dto.threads.push_back(rowToThreadDto(row));
                    }
                    cb(dto);
                },
                [cb](const drogon::orm::DrogonDbException &) {
                    cb(std::nullopt);
                },
                forumId);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        forumId, tenantId);
}

} // namespace pyracms
