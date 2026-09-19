#include "services/AnalyticsService.h"
#include "services/DbError.h"

namespace pyracms {

void AnalyticsService::getSearchQueries(
    const DbClientPtr &db, int tenantId, int limit,
    std::function<void(const std::vector<SearchQueryStat> &)> cb) {

    db->execSqlAsync(
        "SELECT query, COUNT(*) AS count, "
        "AVG(result_count) AS avg_results "
        "FROM search_queries "
        "WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '30 days' "
        "GROUP BY query "
        "ORDER BY count DESC "
        "LIMIT $2::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchQueryStat> stats;
            for (const auto &row : result) {
                SearchQueryStat stat;
                stat.query = row["query"].as<std::string>();
                stat.count = row["count"].as<int>();
                stat.avgResults = row["avg_results"].as<double>();
                stats.push_back(stat);
            }
            cb(stats);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId,
        limit);
}

} // namespace pyracms
