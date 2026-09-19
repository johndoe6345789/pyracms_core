#include "services/AnalyticsService.h"
#include "services/DbError.h"

namespace pyracms {

void AnalyticsService::getPageViews(
    const DbClientPtr &db, int tenantId, const std::string &period,
    std::function<void(const std::vector<PageViewStat> &)> cb) {

    std::string interval = "30 days";
    std::string truncate = "day";

    if (period == "week") {
        interval = "12 weeks";
        truncate = "week";
    } else if (period == "month") {
        interval = "12 months";
        truncate = "month";
    } else {
        // default: day, last 30 days
        interval = "30 days";
        truncate = "day";
    }

    std::string sql = "SELECT date_trunc('" + truncate +
                      "', created_at) AS date, "
                      "COUNT(*) AS count "
                      "FROM page_views "
                      "WHERE tenant_id = $1 "
                      "AND created_at >= NOW() - INTERVAL '" +
                      interval +
                      "' "
                      "GROUP BY date "
                      "ORDER BY date ASC";

    db->execSqlAsync(
        sql,
        [cb](const drogon::orm::Result &result) {
            std::vector<PageViewStat> stats;
            for (const auto &row : result) {
                PageViewStat stat;
                stat.date = row["date"].as<std::string>();
                stat.count = row["count"].as<int>();
                stats.push_back(stat);
            }
            cb(stats);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId);
}

} // namespace pyracms
