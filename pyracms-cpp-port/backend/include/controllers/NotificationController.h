#pragma once

#include <drogon/HttpController.h>
#include "services/NotificationService.h"

namespace pyracms {

class NotificationController : public drogon::HttpController<NotificationController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(NotificationController::list, "/api/notifications", drogon::Get, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(NotificationController::unreadCount, "/api/notifications/unread-count", drogon::Get, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(NotificationController::markRead, "/api/notifications/{id}/read", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(NotificationController::markAllRead, "/api/notifications/read-all", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(NotificationController::deleteNotification, "/api/notifications/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void unreadCount(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void markRead(const drogon::HttpRequestPtr &req,
                  std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                  int id);

    void markAllRead(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void deleteNotification(const drogon::HttpRequestPtr &req,
                            std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                            int id);

private:
    NotificationService notificationService_;
};

} // namespace pyracms
