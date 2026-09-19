#include "services/DbError.h"
#include "services/NotificationService.h"

namespace pyracms {

void NotificationService::getUnreadCount(const DbClientPtr &db, int userId,
                                         CountCallback cb) {
    db->execSqlAsync(
        "SELECT COUNT(*) as cnt FROM notifications "
        "WHERE user_id = $1 AND is_read = FALSE",
        [cb](const drogon::orm::Result &result) {
            cb(result[0]["cnt"].as<int>());
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(0); }, userId);
}

} // namespace pyracms
