#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::getActivityFeed(
    const DbClientPtr &db, int userId, int limit, int offset,
    std::function<void(const std::vector<ActivityItem> &)> cb) {
    db->execSqlAsync(
        "("
        "  SELECT 'article' AS type, a.id, a.display_name AS title, "
        "  '' AS summary, a.created_at "
        "  FROM articles a WHERE a.user_id = $1 "
        "  AND a.is_private = false AND a.status = 'published'"
        ") UNION ALL ("
        "  SELECT 'forum_post' AS type, p.id, COALESCE(p.title, '') AS title, "
        "  LEFT(p.content, 200) AS summary, p.created_at "
        "  FROM forum_posts p WHERE p.user_id = $1"
        ") UNION ALL ("
        "  SELECT 'snippet' AS type, s.id, s.title, "
        "  LEFT(s.code, 200) AS summary, s.created_at "
        "  FROM code_snippets s WHERE s.author_id = $1 "
        "  AND s.visibility = 'public'"
        ") ORDER BY created_at DESC LIMIT $2::int OFFSET $3::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<ActivityItem> items;
            items.reserve(result.size());
            for (const auto &row : result) {
                ActivityItem item;
                item.type = row["type"].as<std::string>();
                item.id = row["id"].as<int>();
                item.title = row["title"].as<std::string>();
                item.summary = row["summary"].isNull()
                                   ? ""
                                   : row["summary"].as<std::string>();
                item.createdAt = row["created_at"].as<std::string>();
                items.push_back(item);
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, userId, limit,
        offset);
}

} // namespace pyracms
