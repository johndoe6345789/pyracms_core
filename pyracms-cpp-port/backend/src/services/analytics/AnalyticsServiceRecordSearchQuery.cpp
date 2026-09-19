#include "services/AnalyticsService.h"
#include "services/DbError.h"

namespace pyracms {

void AnalyticsService::recordSearchQuery(const DbClientPtr &db, int tenantId,
                                         const std::string &query,
                                         int resultCount, int userId,
                                         BoolCallback cb) {

    if (userId > 0) {
        db->execSqlAsync(
            "INSERT INTO search_queries (tenant_id, query, result_count, "
            "user_id) "
            "VALUES ($1, $2, $3, $4)",
            [cb](const drogon::orm::Result &) { cb(true, ""); },
            [cb](const drogon::orm::DrogonDbException &e) {
                cb(false, dbError(e));
            },
            tenantId, query, resultCount, userId);
    } else {
        db->execSqlAsync(
            "INSERT INTO search_queries (tenant_id, query, result_count) "
            "VALUES ($1, $2, $3)",
            [cb](const drogon::orm::Result &) { cb(true, ""); },
            [cb](const drogon::orm::DrogonDbException &e) {
                cb(false, dbError(e));
            },
            tenantId, query, resultCount);
    }
}

} // namespace pyracms
