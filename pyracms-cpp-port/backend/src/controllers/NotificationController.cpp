#include "controllers/NotificationController.h"

namespace pyracms {

void NotificationController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    bool unreadOnly = req->getParameter("unread_only") == "true";
    int limit = 20;
    int offset = 0;

    try {
        auto limitParam = req->getParameter("limit");
        if (!limitParam.empty()) limit = std::stoi(limitParam);
        auto offsetParam = req->getParameter("offset");
        if (!offsetParam.empty()) offset = std::stoi(offsetParam);
    } catch (...) {
        // Use defaults
    }

    if (limit > 100) limit = 100;
    if (limit < 1) limit = 1;

    notificationService_.getNotifications(
        db, userId, unreadOnly, limit, offset,
        [callback](const std::vector<NotificationDto> &notifications) {
            Json::Value result(Json::arrayValue);
            for (const auto &n : notifications) {
                Json::Value item;
                item["id"] = n.id;
                item["userId"] = n.userId;
                item["type"] = n.type;
                item["title"] = n.title;
                item["message"] = n.message;
                item["link"] = n.link;
                item["isRead"] = n.isRead;
                item["createdAt"] = n.createdAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void NotificationController::unreadCount(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    notificationService_.getUnreadCount(
        db, userId,
        [callback](int count) {
            Json::Value result;
            result["count"] = count;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void NotificationController::markRead(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    notificationService_.markRead(
        db, id, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void NotificationController::markAllRead(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    notificationService_.markAllRead(
        db, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void NotificationController::deleteNotification(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    notificationService_.deleteNotification(
        db, id, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
