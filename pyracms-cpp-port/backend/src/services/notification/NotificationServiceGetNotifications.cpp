#include "services/DbError.h"
#include "services/NotificationService.h"

namespace pyracms {

void NotificationService::getNotifications(const DbClientPtr &db, int userId,
                                           bool unreadOnly, int limit,
                                           int offset, ListCallback cb) {
    std::string sql;
    if (unreadOnly) {
        sql = "SELECT * FROM notifications WHERE user_id = $1 AND is_read = "
              "FALSE "
              "ORDER BY created_at DESC LIMIT $2::int OFFSET $3::int";
    } else {
        sql = "SELECT * FROM notifications WHERE user_id = $1 "
              "ORDER BY created_at DESC LIMIT $2::int OFFSET $3::int";
    }

    db->execSqlAsync(
        sql,
        [this, cb](const drogon::orm::Result &result) {
            std::vector<NotificationDto> notifications;
            notifications.reserve(result.size());
            for (const auto &row : result) {
                notifications.push_back(rowToDto(row));
            }
            cb(notifications);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, userId, limit,
        offset);
}

} // namespace pyracms
