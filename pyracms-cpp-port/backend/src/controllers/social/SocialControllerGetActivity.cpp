#include "controllers/SocialController.h"
#include "filters/UserVisibility.h"

namespace pyracms {

void SocialController::getActivity(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    int limit = 20, offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    limit = clampLimit(limitStr, limit, 100);
    offset = clampOffset(offsetStr);

    auto db = drogon::app().getDbClient();

    socialService_.getActivityFeed(
        db, userId, limit, offset,
        [callback](const std::vector<ActivityItem> &items) {
            Json::Value result(Json::arrayValue);
            for (const auto &item : items) {
                Json::Value jsonItem;
                jsonItem["type"] = item.type;
                jsonItem["id"] = item.id;
                jsonItem["title"] = item.title;
                jsonItem["summary"] = item.summary;
                jsonItem["createdAt"] = item.createdAt;
                result.append(jsonItem);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
