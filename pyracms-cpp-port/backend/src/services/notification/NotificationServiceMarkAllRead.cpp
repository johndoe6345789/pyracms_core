#include "services/DbError.h"
#include "services/NotificationService.h"

namespace pyracms {

void NotificationService::markAllRead(const DbClientPtr &db, int userId,
                                      BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE notifications SET is_read = TRUE "
        "WHERE user_id = $1 AND is_read = FALSE",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        userId);
}

} // namespace pyracms
