#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

struct NotificationDto {
    int id;
    int userId;
    std::string type;
    std::string title;
    std::string message;
    std::string link;
    bool isRead;
    std::string createdAt;
};

class NotificationService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;
    using ListCallback = std::function<void(const std::vector<NotificationDto> &)>;
    using CountCallback = std::function<void(int count)>;

    void createNotification(const DbClientPtr &db,
                            int userId,
                            const std::string &type,
                            const std::string &title,
                            const std::string &message,
                            const std::string &link,
                            BoolCallback cb);

    void getNotifications(const DbClientPtr &db,
                          int userId,
                          bool unreadOnly,
                          int limit,
                          int offset,
                          ListCallback cb);

    void markRead(const DbClientPtr &db,
                  int notificationId,
                  int userId,
                  BoolCallback cb);

    void markAllRead(const DbClientPtr &db,
                     int userId,
                     BoolCallback cb);

    void deleteNotification(const DbClientPtr &db,
                            int notificationId,
                            int userId,
                            BoolCallback cb);

    void getUnreadCount(const DbClientPtr &db,
                        int userId,
                        CountCallback cb);

private:
    NotificationDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
