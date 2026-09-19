#include "controllers/NotificationController.h"

namespace pyracms {

void NotificationController::unreadCount(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    notificationService_.getUnreadCount(db, userId, [callback](int count) {
        Json::Value result;
        result["count"] = count;
        callback(drogon::HttpResponse::newHttpJsonResponse(result));
    });
}

} // namespace pyracms
