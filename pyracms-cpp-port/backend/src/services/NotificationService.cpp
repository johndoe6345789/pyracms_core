#include "services/NotificationService.h"

namespace pyracms {

NotificationDto NotificationService::rowToDto(const drogon::orm::Row &row) {
    NotificationDto dto;
    dto.id = row["id"].as<int>();
    dto.userId = row["user_id"].as<int>();
    dto.type = row["type"].as<std::string>();
    dto.title = row["title"].as<std::string>();
    dto.message = row["message"].isNull() ? "" : row["message"].as<std::string>();
    dto.link = row["link"].isNull() ? "" : row["link"].as<std::string>();
    dto.isRead = row["is_read"].as<bool>();
    dto.createdAt = row["created_at"].as<std::string>();
    return dto;
}

void NotificationService::createNotification(const DbClientPtr &db,
                                              int userId,
                                              const std::string &type,
                                              const std::string &title,
                                              const std::string &message,
                                              const std::string &link,
                                              BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO notifications (user_id, type, title, message, link) "
        "VALUES ($1, $2, $3, $4, $5)",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, type, title, message, link);
}

void NotificationService::getNotifications(const DbClientPtr &db,
                                            int userId,
                                            bool unreadOnly,
                                            int limit,
                                            int offset,
                                            ListCallback cb) {
    std::string sql;
    if (unreadOnly) {
        sql = "SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE "
              "ORDER BY created_at DESC LIMIT $2 OFFSET $3";
    } else {
        sql = "SELECT * FROM notifications WHERE user_id = $1 "
              "ORDER BY created_at DESC LIMIT $2 OFFSET $3";
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
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        userId, limit, offset);
}

void NotificationService::markRead(const DbClientPtr &db,
                                    int notificationId,
                                    int userId,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE notifications SET is_read = TRUE "
        "WHERE id = $1 AND user_id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Notification not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        notificationId, userId);
}

void NotificationService::markAllRead(const DbClientPtr &db,
                                       int userId,
                                       BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE notifications SET is_read = TRUE "
        "WHERE user_id = $1 AND is_read = FALSE",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId);
}

void NotificationService::deleteNotification(const DbClientPtr &db,
                                              int notificationId,
                                              int userId,
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
            cb(false, e.base().what());
        },
        notificationId, userId);
}

void NotificationService::getUnreadCount(const DbClientPtr &db,
                                          int userId,
                                          CountCallback cb) {
    db->execSqlAsync(
        "SELECT COUNT(*) as cnt FROM notifications "
        "WHERE user_id = $1 AND is_read = FALSE",
        [cb](const drogon::orm::Result &result) {
            cb(result[0]["cnt"].as<int>());
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(0);
        },
        userId);
}

} // namespace pyracms
