#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/SearchService.h"

#include <cctype>
#include <memory>
#include <mutex>

namespace pyracms {

void SearchService::searchForumPosts(
    const DbClientPtr &db, int tenantId, const std::string &tsQuery, int limit,
    int offset,
    std::function<void(const std::vector<SearchResultItem> &, int)> cb) {

    db->execSqlAsync(
        "SELECT p.id, p.title, "
        "LEFT(p.content, 200) AS snippet, "
        "ts_rank(to_tsvector('english', p.title || ' ' || p.content), "
        "to_tsquery('english', $2)) AS rank, "
        "p.created_at, p.thread_id "
        "FROM forum_posts p "
        "JOIN forum_threads t ON t.id = p.thread_id "
        "JOIN forums f ON f.id = t.forum_id "
        "JOIN forum_categories c ON c.id = f.category_id "
        "WHERE c.tenant_id = $1 "
        "AND to_tsvector('english', p.title || ' ' || p.content) @@ "
        "to_tsquery('english', $2) "
        "ORDER BY rank DESC LIMIT $3::int OFFSET $4::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchResultItem> items;
            for (const auto &row : result) {
                SearchResultItem item;
                item.type = "forum_post";
                item.id = row["id"].as<int>();
                item.title =
                    row["title"].isNull() ? "" : row["title"].as<std::string>();
                item.snippet = row["snippet"].isNull()
                                   ? ""
                                   : row["snippet"].as<std::string>();
                item.url = "/forum/thread/" +
                           std::to_string(row["thread_id"].as<int>());
                item.rank = row["rank"].as<double>();
                item.createdAt = row["created_at"].as<std::string>();
                items.push_back(item);
            }
            cb(items, static_cast<int>(items.size()));
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}, 0); }, tenantId,
        tsQuery, limit, offset);
}

} // namespace pyracms
