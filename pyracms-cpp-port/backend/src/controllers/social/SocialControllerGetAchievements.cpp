#include "controllers/SocialController.h"
#include "filters/UserVisibility.h"

namespace pyracms {

void SocialController::getAchievements(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    socialService_.getUserAchievements(
        db, userId,
        [callback](const std::vector<AchievementDto> &achievements) {
            Json::Value result(Json::arrayValue);
            for (const auto &a : achievements) {
                Json::Value item;
                item["id"] = a.id;
                item["name"] = a.name;
                item["displayName"] = a.displayName;
                item["description"] = a.description;
                item["icon"] = a.icon;
                item["earned"] = a.earned;
                item["earnedAt"] = a.earnedAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
