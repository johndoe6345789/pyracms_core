#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/SearchService.h"

#include <cctype>
#include <memory>
#include <mutex>

namespace pyracms {

void SearchService::searchSnippets(
    const DbClientPtr &db, int tenantId, const std::string &tsQuery, int limit,
    int offset,
    std::function<void(const std::vector<SearchResultItem> &, int)> cb) {

    db->execSqlAsync(
        "SELECT s.id, s.title, s.language, "
        "LEFT(s.code, 200) AS snippet, "
        "ts_rank(to_tsvector('english', s.title || ' ' || s.code), "
        "to_tsquery('english', $2)) AS rank, "
        "s.created_at "
        "FROM code_snippets s "
        "WHERE s.tenant_id = $1 AND s.visibility = 'public' "
        "AND to_tsvector('english', s.title || ' ' || s.code) @@ "
        "to_tsquery('english', $2) "
        "ORDER BY rank DESC LIMIT $3::int OFFSET $4::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchResultItem> items;
            for (const auto &row : result) {
                SearchResultItem item;
                item.type = "snippet";
                item.id = row["id"].as<int>();
                item.title = row["title"].as<std::string>();
                item.snippet = row["snippet"].isNull()
                                   ? ""
                                   : row["snippet"].as<std::string>();
                item.url = "/snippets/" + std::to_string(row["id"].as<int>());
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
