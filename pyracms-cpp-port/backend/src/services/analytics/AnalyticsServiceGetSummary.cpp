#include "services/AnalyticsService.h"

namespace pyracms {

void AnalyticsService::getSummary(
    const DbClientPtr &db, int tenantId,
    std::function<void(bool ok, const AnalyticsSummary &)> cb) {
    db->execSqlAsync(
        "SELECT (SELECT COUNT(*) FROM page_views WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '7 days')::int AS v7, "
        "(SELECT COUNT(*) FROM page_views WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '30 days')::int AS v30",
        [this, db, tenantId, cb](const drogon::orm::Result &r) {
            AnalyticsSummary s;
            s.views7 = r[0]["v7"].as<int>();
            s.views30 = r[0]["v30"].as<int>();
            db->execSqlAsync(
                "SELECT path, COUNT(*)::int AS views FROM page_views "
                "WHERE tenant_id = $1 AND created_at >= NOW() - "
                "INTERVAL '30 days' GROUP BY path "
                "ORDER BY views DESC, path LIMIT 10",
                [s, cb](const drogon::orm::Result &rows) mutable {
                    for (const auto &row : rows)
                        s.topPages.push_back(
                            {row["path"].as<std::string>(),
                             row["path"].as<std::string>(),
                             row["views"].as<int>()});
                    cb(true, s);
                },
                [cb](const drogon::orm::DrogonDbException &) {
                    cb(false, {});
                },
                tenantId);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(false, {}); },
        tenantId);
}

} // namespace pyracms
