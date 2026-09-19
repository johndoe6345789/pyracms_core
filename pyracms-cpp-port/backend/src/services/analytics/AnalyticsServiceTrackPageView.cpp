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
        "ip_hash) SELECT $1::int, $2::text, $3::text, $4::text, "
        "$5::text "
        "WHERE EXISTS (SELECT 1 FROM tenants WHERE id = $1::int)",
        [cb](const drogon::orm::Result &r) {
            if (r.affectedRows() == 0)
                cb(false, "Unknown tenant");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, path, referrer, userAgent, ipHash);
}

} // namespace pyracms
