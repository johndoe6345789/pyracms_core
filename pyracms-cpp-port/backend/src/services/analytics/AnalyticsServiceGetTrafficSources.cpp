#include "services/AnalyticsService.h"
#include "services/DbError.h"

namespace pyracms {

void AnalyticsService::getTrafficSources(
    const DbClientPtr &db, int tenantId, int limit,
    std::function<void(const std::vector<TrafficSource> &)> cb) {

    db->execSqlAsync(
        "SELECT COALESCE(NULLIF(referrer, ''), 'direct') AS referrer, "
        "COUNT(*) AS count "
        "FROM page_views "
        "WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '30 days' "
        "GROUP BY referrer "
        "ORDER BY count DESC "
        "LIMIT $2::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<TrafficSource> sources;
            for (const auto &row : result) {
                TrafficSource source;
                source.referrer = row["referrer"].as<std::string>();
                source.count = row["count"].as<int>();
                sources.push_back(source);
            }
            cb(sources);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId,
        limit);
}

} // namespace pyracms
