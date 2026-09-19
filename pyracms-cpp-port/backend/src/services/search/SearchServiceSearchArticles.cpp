#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/SearchService.h"

#include <cctype>
#include <memory>
#include <mutex>

namespace pyracms {

void SearchService::searchArticles(
    const DbClientPtr &db, int tenantId, const std::string &tsQuery, int limit,
    int offset,
    std::function<void(const std::vector<SearchResultItem> &, int)> cb) {

    db->execSqlAsync(
        "SELECT a.id, a.name, a.display_name, "
        "ts_rank(to_tsvector('english', a.name || ' ' || a.display_name), "
        "to_tsquery('english', $2)) AS rank, "
        "a.created_at "
        "FROM articles a "
        "WHERE a.tenant_id = $1 AND a.is_private = false "
        "AND a.status = 'published' "
        "AND to_tsvector('english', a.name || ' ' || a.display_name) @@ "
        "to_tsquery('english', $2) "
        "ORDER BY rank DESC LIMIT $3::int OFFSET $4::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchResultItem> items;
            for (const auto &row : result) {
                SearchResultItem item;
                item.type = "article";
                item.id = row["id"].as<int>();
                item.title = row["display_name"].as<std::string>();
                item.snippet = row["name"].as<std::string>();
                item.url = "/articles/" + row["name"].as<std::string>();
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
