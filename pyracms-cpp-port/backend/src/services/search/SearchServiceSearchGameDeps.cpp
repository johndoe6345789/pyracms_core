#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/SearchService.h"

#include <cctype>
#include <memory>
#include <mutex>

namespace pyracms {

void SearchService::searchGameDeps(
    const DbClientPtr &db, int tenantId, const std::string &tsQuery, int limit,
    int offset,
    std::function<void(const std::vector<SearchResultItem> &, int)> cb) {

    db->execSqlAsync(
        "SELECT g.id, g.name, g.display_name, g.description, "
        "ts_rank(to_tsvector('english', g.name || ' ' || g.display_name || ' ' "
        "|| g.description), "
        "to_tsquery('english', $2)) AS rank, "
        "g.created_at "
        "FROM gamedep_pages g "
        "WHERE g.tenant_id = $1 "
        "AND to_tsvector('english', g.name || ' ' || g.display_name || ' ' || "
        "g.description) "
        "@@ to_tsquery('english', $2) "
        "ORDER BY rank DESC LIMIT $3::int OFFSET $4::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchResultItem> items;
            for (const auto &row : result) {
                SearchResultItem item;
                item.type = "gamedep";
                item.id = row["id"].as<int>();
                item.title = row["display_name"].as<std::string>();
                item.snippet = row["description"].isNull()
                                   ? ""
                                   : row["description"].as<std::string>();
                item.url = "/gamedep/" + row["name"].as<std::string>();
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
