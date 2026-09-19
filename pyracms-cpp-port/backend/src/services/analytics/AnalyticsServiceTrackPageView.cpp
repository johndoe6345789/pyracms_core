#include "services/AnalyticsService.h"
#include "services/DbError.h"

namespace pyracms {

void AnalyticsService::trackPageView(const DbClientPtr &db, int tenantId,
                                     const std::string &path,
                                     const std::string &referrer,
                                     const std::string &userAgent,
                                     const std::string &ipHash,
                                     BoolCallback cb) {

    db->execSqlAsync(
        "INSERT INTO page_views (tenant_id, path, referrer, user_agent, "
        "ip_hash) "
        "VALUES ($1, $2, $3, $4, $5)",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, path, referrer, userAgent, ipHash);
}

} // namespace pyracms
