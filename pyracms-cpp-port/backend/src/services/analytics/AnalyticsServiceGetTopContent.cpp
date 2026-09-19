#include "services/AnalyticsService.h"
#include "services/DbError.h"

namespace pyracms {

void AnalyticsService::getTopContent(
    const DbClientPtr &db, int tenantId, int limit,
    std::function<void(const std::vector<TopContentItem> &)> cb) {

    db->execSqlAsync(
        "SELECT path, COUNT(*) AS views "
        "FROM page_views "
        "WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '30 days' "
        "GROUP BY path "
        "ORDER BY views DESC "
        "LIMIT $2::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<TopContentItem> items;
            for (const auto &row : result) {
                TopContentItem item;
                item.path = row["path"].as<std::string>();
                item.title = item.path; // Could be enriched with actual titles
                item.views = row["views"].as<int>();
                items.push_back(item);
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId,
        limit);
}

} // namespace pyracms
