#include "services/DbError.h"
#include "services/NotificationService.h"

namespace pyracms {

void NotificationService::createNotification(const DbClientPtr &db, int userId,
                                             const std::string &type,
                                             const std::string &title,
                                             const std::string &message,
                                             const std::string &link,
                                             BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO notifications (user_id, type, title, message, link) "
        "VALUES ($1, $2, $3, $4, $5)",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        userId, type, title, message, link);
}

} // namespace pyracms
