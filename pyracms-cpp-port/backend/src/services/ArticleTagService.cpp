#include "services/ArticleTagService.h"

namespace pyracms {

void ArticleTagService::listTagCloud(
    const DbClientPtr &db,
    int tenantId,
    TagCloudCallback cb) {
    db->execSqlAsync(
        "SELECT MIN(at.name) AS name, COUNT(*)::int AS tag_count "
        "FROM article_tags at "
        "JOIN articles a ON a.id = at.article_id "
        "WHERE a.tenant_id = $1 AND a.is_private = false "
        "GROUP BY lower(at.name) "
        "ORDER BY tag_count DESC, name ASC",
        [cb](const drogon::orm::Result &result) {
            std::vector<ArticleTagCloudItem> tags;
            tags.reserve(result.size());
            for (const auto &row : result) {
                ArticleTagCloudItem item;
                item.name = row["name"].as<std::string>();
                item.count = row["tag_count"].as<int>();
                tags.push_back(std::move(item));
            }
            cb(tags);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "listTagCloud error: " << e.base().what();
            cb({});
        },
        tenantId);
}

} // namespace pyracms
