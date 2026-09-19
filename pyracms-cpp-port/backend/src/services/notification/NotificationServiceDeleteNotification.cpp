#include "services/DbError.h"
#include "services/NotificationService.h"

namespace pyracms {

void NotificationService::deleteNotification(const DbClientPtr &db,
                                             int notificationId, int userId,
                                             BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Notification not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        notificationId, userId);
}

} // namespace pyracms
